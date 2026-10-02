import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/blocked — list blocked dates and time slots
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const blockedDates = await prisma.blockedDate.findMany({
    orderBy: { date: 'asc' },
  });

  const blockedTimeSlots = await prisma.blockedTimeSlot.findMany({
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });

  return NextResponse.json({ blockedDates, blockedTimeSlots });
}

// POST /api/blocked — add a blocked date or time slot
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, date, startTime, endTime, reason } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date requise' }, { status: 400 });
    }

    if (type === 'date') {
      const existing = await prisma.blockedDate.findUnique({ where: { date } });
      if (existing) {
        return NextResponse.json({ error: 'Date déjà bloquée' }, { status: 409 });
      }

      const blocked = await prisma.blockedDate.create({
        data: { date, reason: reason || null },
      });
      return NextResponse.json(blocked, { status: 201 });
    } else if (type === 'slot') {
      if (!startTime || !endTime) {
        return NextResponse.json({ error: 'Heures de début et fin requises' }, { status: 400 });
      }

      const blocked = await prisma.blockedTimeSlot.create({
        data: { date, startTime, endTime, reason: reason || null },
      });
      return NextResponse.json(blocked, { status: 201 });
    }

    return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}

// DELETE /api/blocked — delete a blocked date or time slot
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json({ error: 'ID et type requis' }, { status: 400 });
    }

    if (type === 'date') {
      await prisma.blockedDate.delete({ where: { id } });
    } else if (type === 'slot') {
      await prisma.blockedTimeSlot.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
