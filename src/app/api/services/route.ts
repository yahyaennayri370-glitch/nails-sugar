import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sanitize } from '@/lib/utils';

// GET /api/services — list all services (public: active only, admin: all)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const isAdmin = !!session;
  
  const services = await prisma.service.findMany({
    where: isAdmin ? {} : { active: true },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json(services);
}

// POST /api/services — create a service (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name, description, fullDescription, category, price, priceOnDemand,
      duration, image, included, benefits, beforeAdvice, aftercare,
      idealFor, expectedResult, active, sortOrder
    } = body;

    if (!name || !description || !duration) {
      return NextResponse.json({ error: 'Nom, description et durée requis' }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name: sanitize(name),
        description: sanitize(description),
        fullDescription: fullDescription ? sanitize(fullDescription) : null,
        category: category ? sanitize(category) : null,
        price: priceOnDemand ? null : (price ? parseFloat(price) : null),
        priceOnDemand: !!priceOnDemand,
        duration: parseInt(duration),
        image: image || null,
        included: included ? sanitize(included) : null,
        benefits: benefits ? sanitize(benefits) : null,
        beforeAdvice: beforeAdvice ? sanitize(beforeAdvice) : null,
        aftercare: aftercare ? sanitize(aftercare) : null,
        idealFor: idealFor ? sanitize(idealFor) : null,
        expectedResult: expectedResult ? sanitize(expectedResult) : null,
        active: active !== undefined ? active : true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}

// PUT /api/services — update a service (admin only)
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id, name, description, fullDescription, category, price, priceOnDemand,
      duration, image, included, benefits, beforeAdvice, aftercare,
      idealFor, expectedResult, active, sortOrder
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: sanitize(name) }),
        ...(description !== undefined && { description: sanitize(description) }),
        ...(fullDescription !== undefined && { fullDescription: fullDescription ? sanitize(fullDescription) : null }),
        ...(category !== undefined && { category: category ? sanitize(category) : null }),
        ...(priceOnDemand !== undefined && { priceOnDemand }),
        ...(price !== undefined && { price: priceOnDemand ? null : (price ? parseFloat(price) : null) }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
        ...(image !== undefined && { image }),
        ...(included !== undefined && { included: included ? sanitize(included) : null }),
        ...(benefits !== undefined && { benefits: benefits ? sanitize(benefits) : null }),
        ...(beforeAdvice !== undefined && { beforeAdvice: beforeAdvice ? sanitize(beforeAdvice) : null }),
        ...(aftercare !== undefined && { aftercare: aftercare ? sanitize(aftercare) : null }),
        ...(idealFor !== undefined && { idealFor: idealFor ? sanitize(idealFor) : null }),
        ...(expectedResult !== undefined && { expectedResult: expectedResult ? sanitize(expectedResult) : null }),
        ...(active !== undefined && { active }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json(service);
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

// DELETE /api/services — delete a service (admin only)
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

    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
