import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { timeToMinutes, minutesToTime } from '@/lib/utils';
import {
  sanitizeInput,
  validateBookingRequest,
  isValidStatus,
  isValidTime,
  isValidDate,
} from '@/lib/validation';
import { logger } from '@/lib/logger';

// GET /api/appointments — list appointments (admin only)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter');
  const date = searchParams.get('date');
  const customerId = searchParams.get('customerId');

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  let where: Record<string, unknown> = {};

  if (customerId) {
    where.customerId = customerId;
  }

  if (filter) {
    switch (filter) {
      case 'today':
        where.date = today;
        break;
      case 'tomorrow':
        where.date = tomorrow;
        break;
      case 'week':
        where.date = { gte: today, lte: weekEnd };
        break;
      case 'upcoming':
        where.date = { gte: today };
        where.status = { in: ['pending', 'confirmed'] };
        break;
      case 'pending':
        where.status = 'pending';
        break;
      case 'confirmed':
        where.status = 'confirmed';
        break;
      case 'completed':
        where.status = 'completed';
        break;
      case 'cancelled':
        where.status = 'cancelled';
        break;
    }
  }

  if (date && !filter) {
    // Validate date format to prevent injection
    if (!isValidDate(date)) {
      return NextResponse.json({ error: 'Format de date invalide' }, { status: 400 });
    }
    where.date = date;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      customer: true,
      service: true,
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });

  return NextResponse.json(appointments);
}

// POST /api/appointments — create a new appointment (public)
// CRITICAL: Uses a serialized transaction to prevent double-booking race conditions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // === STEP 1: Comprehensive input validation ===
    const validationError = validateBookingRequest(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { serviceId, date, startTime, customerName, customerPhone, customerEmail, customerInstagram, notes } = body;

    // === STEP 2: Use a serialized transaction to prevent race conditions ===
    // This ensures only one booking can be created for an overlapping time slot
    const result = await prisma.$transaction(async (tx) => {
      // Get service — ALWAYS use server-side duration/price
      const service = await tx.service.findUnique({ where: { id: serviceId } });
      if (!service || !service.active) {
        return { error: 'Service non disponible', status: 400 };
      }

      // Calculate end time from SERVER-SIDE service duration (never trust client)
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = startMinutes + service.duration;
      const endTime = minutesToTime(endMinutes);

      // Check day availability
      const dayOfWeek = new Date(date + 'T00:00:00').getDay();
      const availability = await tx.availability.findUnique({
        where: { dayOfWeek },
        include: { breaks: true },
      });

      if (!availability || !availability.isOpen || !availability.openTime || !availability.closeTime) {
        return { error: 'Le salon est fermé ce jour', status: 400 };
      }

      // Check within working hours
      const openMinutes = timeToMinutes(availability.openTime);
      const closeMinutes = timeToMinutes(availability.closeTime);
      if (startMinutes < openMinutes || endMinutes > closeMinutes) {
        return { error: "Horaire en dehors des heures d'ouverture", status: 400 };
      }

      // Check breaks
      for (const brk of availability.breaks) {
        const bStart = timeToMinutes(brk.startTime);
        const bEnd = timeToMinutes(brk.endTime);
        if (startMinutes < bEnd && endMinutes > bStart) {
          return { error: 'Créneau pendant la pause', status: 400 };
        }
      }

      // Check blocked dates
      const blockedDate = await tx.blockedDate.findUnique({ where: { date } });
      if (blockedDate) {
        return { error: 'Date bloquée', status: 400 };
      }

      // Check blocked time slots
      const blockedSlots = await tx.blockedTimeSlot.findMany({ where: { date } });
      for (const slot of blockedSlots) {
        const bStart = timeToMinutes(slot.startTime);
        const bEnd = timeToMinutes(slot.endTime);
        if (startMinutes < bEnd && endMinutes > bStart) {
          return { error: 'Créneau horaire bloqué', status: 400 };
        }
      }

      // === CRITICAL: Check existing appointments inside transaction ===
      // This prevents double-booking from concurrent requests
      const existingAppointments = await tx.appointment.findMany({
        where: {
          date,
          status: { in: ['pending', 'confirmed'] },
        },
      });

      for (const appt of existingAppointments) {
        const aStart = timeToMinutes(appt.startTime);
        const aEnd = timeToMinutes(appt.endTime);
        if (startMinutes < aEnd && endMinutes > aStart) {
          logger.bookingEvent('conflict', { date, startTime, existingId: appt.id });
          return {
            error: "Ce créneau vient d'être réservé. Veuillez choisir un autre horaire.",
            status: 409,
          };
        }
      }

      // Find or create customer
      const sanitizedPhone = sanitizeInput(customerPhone);
      const sanitizedName = sanitizeInput(customerName);

      let customer = await tx.customer.findFirst({
        where: { phone: sanitizedPhone },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: sanitizedName,
            phone: sanitizedPhone,
            email: customerEmail ? sanitizeInput(customerEmail) : null,
            instagram: customerInstagram ? sanitizeInput(customerInstagram) : null,
          },
        });
      } else {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            name: sanitizedName,
            ...(customerEmail && { email: sanitizeInput(customerEmail) }),
            ...(customerInstagram && { instagram: sanitizeInput(customerInstagram) }),
          },
        });
      }

      // Create appointment
      const appointment = await tx.appointment.create({
        data: {
          customerId: customer.id,
          serviceId,
          date,
          startTime,
          endTime,
          status: 'pending',
          notes: notes ? sanitizeInput(String(notes).substring(0, 500)) : null,
        },
        include: {
          customer: true,
          service: true,
        },
      });

      logger.bookingEvent('created', {
        appointmentId: appointment.id,
        date,
        startTime,
        endTime,
        serviceId,
      });

      return { appointment, status: 201 };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.appointment, { status: 201 });
  } catch (error) {
    logger.apiError('/api/appointments', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du rendez-vous' },
      { status: 500 }
    );
  }
}

// PUT /api/appointments — update appointment status (admin only)
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    if (!status || !isValidStatus(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    // Verify appointment exists before updating
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Rendez-vous non trouvé' }, { status: 404 });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        service: true,
      },
    });

    logger.bookingEvent('updated', {
      appointmentId: id,
      oldStatus: existing.status,
      newStatus: status,
    });

    return NextResponse.json(appointment);
  } catch (error) {
    logger.apiError('/api/appointments/PUT', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

// DELETE /api/appointments — delete an appointment (admin only)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    // Verify appointment exists
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Rendez-vous non trouvé' }, { status: 404 });
    }

    await prisma.appointment.delete({ where: { id } });

    logger.bookingEvent('cancelled', { appointmentId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.apiError('/api/appointments/DELETE', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
