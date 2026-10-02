import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/customers — list customers (admin only)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const search = searchParams.get('search');

  if (id) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        appointments: {
          include: { service: true },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    return NextResponse.json(customer);
  }

  let where = {};
  if (search) {
    where = {
      OR: [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { instagram: { contains: search } },
      ],
    };
  }

  const customers = await prisma.customer.findMany({
    where,
    include: {
      _count: { select: { appointments: true } },
      appointments: {
        orderBy: { date: 'desc' },
        take: 1,
        select: { date: true, startTime: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(customers);
}
