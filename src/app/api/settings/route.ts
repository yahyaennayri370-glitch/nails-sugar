import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/settings — get all settings (public for specific keys, all for admin)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  const session = await getServerSession(authOptions);

  if (key) {
    const setting = await prisma.setting.findUnique({ where: { key } });
    return NextResponse.json(setting);
  }

  const settings = await prisma.setting.findMany();

  // Convert to key-value object
  const settingsObj: Record<string, string> = {};
  for (const s of settings) {
    settingsObj[s.key] = s.value;
  }

  // If not admin, only return public settings
  if (!session) {
    const publicKeys = [
      'businessName', 'phone', 'instagram', 'instagramUrl', 'tiktok',
      'location', 'heroTitle', 'heroSubtitle', 'aboutText', 'aboutText2',
    ];
    const publicSettings: Record<string, string> = {};
    for (const k of publicKeys) {
      if (settingsObj[k]) publicSettings[k] = settingsObj[k];
    }
    return NextResponse.json(publicSettings);
  }

  return NextResponse.json(settingsObj);
}

// PUT /api/settings — update settings (admin only)
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();

    for (const [key, value] of Object.entries(body)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    const settings = await prisma.setting.findMany();
    const settingsObj: Record<string, string> = {};
    for (const s of settings) {
      settingsObj[s.key] = s.value;
    }

    return NextResponse.json(settingsObj);
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
