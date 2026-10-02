import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/dashboard — dashboard statistics (admin only)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [
    todayAppointments,
    upcomingAppointments,
    pendingCount,
    totalCustomers,
    activeServices,
    recentAppointments,
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: { date: today },
      include: { customer: true, service: true },
      orderBy: { startTime: 'asc' },
    }),
    prisma.appointment.count({
      where: {
        date: { gte: tomorrow },
        status: { in: ['pending', 'confirmed'] },
      },
    }),
    prisma.appointment.count({
      where: { status: 'pending' },
    }),
    prisma.customer.count(),
    prisma.service.count({ where: { active: true } }),
    prisma.appointment.findMany({
      where: {
        date: { gte: today },
        status: { in: ['pending', 'confirmed'] },
      },
      include: { customer: true, service: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: 10,
    }),
  ]);

  return NextResponse.json({
    todayAppointments,
    upcomingCount: upcomingAppointments,
    pendingCount,
    totalCustomers,
    activeServices,
    recentAppointments,
    todayCount: todayAppointments.length,
  });
}
