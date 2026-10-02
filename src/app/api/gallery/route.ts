import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import {
  sanitizeFilename,
  isAllowedImageExtension,
  validateImageMagicBytes,
  sanitizeInput,
} from '@/lib/validation';
import { logger } from '@/lib/logger';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'gallery');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

// GET /api/gallery — list gallery images (public)
export async function GET() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json(images);
}

// POST /api/gallery — upload a gallery image (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 });
    }

    // === SECURITY CHECK 1: File size ===
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 10 MB)' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'Fichier vide' },
        { status: 400 }
      );
    }

    // === SECURITY CHECK 2: MIME type from Content-Type header ===
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      logger.warn('Gallery upload rejected: invalid MIME type', { type: file.type });
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Formats acceptés: JPEG, PNG, WebP, AVIF' },
        { status: 400 }
      );
    }

    // === SECURITY CHECK 3: File extension ===
    const originalName = file.name || 'upload.png';
    if (!isAllowedImageExtension(originalName)) {
      logger.warn('Gallery upload rejected: invalid extension', { filename: originalName });
      return NextResponse.json(
        { error: 'Extension de fichier non autorisée' },
        { status: 400 }
      );
    }

    // === SECURITY CHECK 4: Magic bytes validation ===
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const magicCheck = validateImageMagicBytes(buffer);

    if (!magicCheck.valid) {
      logger.warn('Gallery upload rejected: invalid magic bytes', {
        filename: originalName,
        claimedType: file.type,
      });
      return NextResponse.json(
        { error: 'Le fichier ne semble pas être une image valide' },
        { status: 400 }
      );
    }

    // === SECURITY CHECK 5: Verify magic bytes match claimed MIME ===
    const mimeToMagic: Record<string, string[]> = {
      'image/jpeg': ['image/jpeg'],
      'image/png': ['image/png'],
      'image/webp': ['image/webp'],
      'image/avif': ['image/avif'],
    };
    const allowedMagicTypes = mimeToMagic[file.type];
    if (allowedMagicTypes && magicCheck.detectedType && !allowedMagicTypes.includes(magicCheck.detectedType)) {
      logger.warn('Gallery upload rejected: MIME mismatch', {
        claimed: file.type,
        detected: magicCheck.detectedType,
      });
      return NextResponse.json(
        { error: 'Le type du fichier ne correspond pas à son extension' },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // === SECURITY CHECK 6: Generate safe filename (never use user-supplied name) ===
    const ext = originalName.split('.').pop()?.toLowerCase() || 'png';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(ext) ? ext : 'png';
    const filename = `gallery-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${safeExt}`;
    const sanitizedFilename = sanitizeFilename(filename);
    const filepath = path.join(UPLOAD_DIR, sanitizedFilename);

    // === SECURITY CHECK 7: Prevent path traversal ===
    const resolvedPath = path.resolve(filepath);
    const resolvedUploadDir = path.resolve(UPLOAD_DIR);
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      logger.error('Gallery upload: path traversal attempt', { filepath, resolvedPath });
      return NextResponse.json({ error: 'Erreur de sécurité' }, { status: 400 });
    }

    // Write file
    await writeFile(filepath, buffer);

    // Get max sort order
    const maxOrder = await prisma.galleryImage.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    // Create database entry
    const image = await prisma.galleryImage.create({
      data: {
        filename: `uploads/gallery/${sanitizedFilename}`,
        alt: alt ? sanitizeInput(String(alt).substring(0, 200)) : null,
        sortOrder: (maxOrder?.sortOrder || 0) + 1,
      },
    });

    logger.info('Gallery image uploaded', { imageId: image.id, filename: sanitizedFilename });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    logger.apiError('/api/gallery/POST', error);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}

// PUT /api/gallery — update gallery image order or metadata (admin only)
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Handle reorder
    if (body.reorder && Array.isArray(body.reorder)) {
      // Validate all IDs are strings
      if (!body.reorder.every((id: unknown) => typeof id === 'string')) {
        return NextResponse.json({ error: 'IDs invalides' }, { status: 400 });
      }

      for (let i = 0; i < body.reorder.length; i++) {
        await prisma.galleryImage.update({
          where: { id: body.reorder[i] },
          data: { sortOrder: i + 1 },
        });
      }
      const images = await prisma.galleryImage.findMany({
        orderBy: { sortOrder: 'asc' },
      });
      return NextResponse.json(images);
    }

    // Handle single update
    const { id, alt, featured } = body;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    // Verify image exists
    const existing = await prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Image non trouvée' }, { status: 404 });
    }

    // If setting featured, unfeatured all others first
    if (featured) {
      await prisma.galleryImage.updateMany({
        data: { featured: false },
      });
    }

    const image = await prisma.galleryImage.update({
      where: { id },
      data: {
        ...(alt !== undefined && { alt: sanitizeInput(String(alt).substring(0, 200)) }),
        ...(featured !== undefined && { featured: !!featured }),
      },
    });

    return NextResponse.json(image);
  } catch (error) {
    logger.apiError('/api/gallery/PUT', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

// DELETE /api/gallery — delete a gallery image (admin only)
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

    const image = await prisma.galleryImage.findUnique({ where: { id } });
    if (!image) {
      return NextResponse.json({ error: 'Image non trouvée' }, { status: 404 });
    }

    // Delete file if it's an uploaded file
    if (image.filename.startsWith('uploads/')) {
      const filepath = path.join(process.cwd(), 'public', image.filename);
      // Security: verify path is within public directory
      const resolvedPath = path.resolve(filepath);
      const publicDir = path.resolve(path.join(process.cwd(), 'public'));
      if (resolvedPath.startsWith(publicDir)) {
        try {
          await unlink(filepath);
        } catch {
          // File might not exist, continue
        }
      }
    }

    await prisma.galleryImage.delete({ where: { id } });
    logger.info('Gallery image deleted', { imageId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.apiError('/api/gallery/DELETE', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
