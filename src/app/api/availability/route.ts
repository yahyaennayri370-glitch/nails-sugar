import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTimeSlots } from '@/lib/utils';
import { DEFAULT_SERVICES, ensureAvailabilitySeeded } from '@/lib/seed-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/availability — get availability schedule or available slots for a date
export async function GET(req: NextRequest) {
  await ensureAvailabilitySeeded();

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const serviceId = searchParams.get('serviceId');

  // If date and serviceId provided, return available time slots (public)
  if (date && serviceId) {
    let service = await prisma.service.findUnique({ where: { id: serviceId } });

    if (!service) {
      service = await prisma.service.findFirst({
        where: {
          OR: [
            { name: { equals: serviceId } },
            { id: { equals: serviceId } },
          ],
        },
      });
    }

    // Fallback lookup from default services
    const fallbackService = DEFAULT_SERVICES.find(
      s => s.id === serviceId || s.name.toLowerCase() === serviceId.toLowerCase()
    );

    const duration = service?.duration || fallbackService?.duration || 45;
    const active = service ? service.active : true;

    if (!active) {
      return NextResponse.json({ slots: [], error: 'Service non disponible' });
    }

    // Check if date is blocked
    const blockedDate = await prisma.blockedDate.findUnique({ where: { date } });
    if (blockedDate) {
      return NextResponse.json({ slots: [], closed: true, reason: blockedDate.reason });
    }

    // Get day availability
    const dayOfWeek = new Date(date + 'T00:00:00').getDay();
    let availability = await prisma.availability.findUnique({
      where: { dayOfWeek },
      include: { breaks: true },
    });

    const openTime = availability?.openTime || '10:00';
    const closeTime = availability?.closeTime || '20:00';
    const isOpen = availability ? availability.isOpen : true;

    if (!isOpen) {
      return NextResponse.json({ slots: [], closed: true });
    }

    // Get blocked time slots
    const blockedSlots = await prisma.blockedTimeSlot.findMany({ where: { date } });

    // Get existing appointments
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        date,
        status: { in: ['pending', 'confirmed'] },
      },
      select: { startTime: true, endTime: true },
    });

    const breaks = availability?.breaks ? availability.breaks.map((b) => ({ startTime: b.startTime, endTime: b.endTime })) : [{ startTime: '13:00', endTime: '14:00' }];

    const slots = generateTimeSlots(
      openTime,
      closeTime,
      duration,
      breaks,
      blockedSlots.map((b) => ({ startTime: b.startTime, endTime: b.endTime })),
      existingAppointments
    );

    return NextResponse.json({ slots, closed: false });
  }

  // Otherwise, return full availability schedule (admin)
  const availabilities = await prisma.availability.findMany({
    include: { breaks: true },
    orderBy: { dayOfWeek: 'asc' },
  });

  return NextResponse.json(availabilities);
}

// PUT /api/availability — update availability (admin only)
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { schedule } = body;

    if (!Array.isArray(schedule)) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    // Update each day's availability
    for (const day of schedule) {
      const { dayOfWeek, isOpen, openTime, closeTime, breaks: dayBreaks } = day;

      // Upsert availability
      const availability = await prisma.availability.upsert({
        where: { dayOfWeek },
        update: {
          isOpen,
          openTime: isOpen ? openTime : null,
          closeTime: isOpen ? closeTime : null,
        },
        create: {
          dayOfWeek,
          isOpen,
          openTime: isOpen ? openTime : null,
          closeTime: isOpen ? closeTime : null,
        },
      });

      // Delete existing breaks for this day
      await prisma.break.deleteMany({
        where: { availabilityId: availability.id },
      });

      // Create new breaks
      if (isOpen && Array.isArray(dayBreaks)) {
        for (const brk of dayBreaks) {
          await prisma.break.create({
            data: {
              availabilityId: availability.id,
              startTime: brk.startTime,
              endTime: brk.endTime,
            },
          });
        }
      }
    }

    // Return updated schedule
    const updatedSchedule = await prisma.availability.findMany({
      include: { breaks: true },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json(updatedSchedule);
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
