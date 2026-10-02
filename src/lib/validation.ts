/**
 * Input validation and sanitization utilities.
 *
 * Provides strict validation for all user inputs to prevent
 * injection attacks, XSS, and data integrity issues.
 */

/** Sanitize a string: strip dangerous HTML characters and trim */
export function sanitizeInput(str: string): string {
  return str
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/** Validate an email address */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) && email.length <= 254;
}

/** Validate a Moroccan phone number (flexible) */
export function isValidPhone(phone: string): boolean {
  // Accept formats: 0612345678, +212612345678, 06 12 34 56 78, etc.
  const cleaned = phone.replace(/[\s\-().]/g, '');
  return /^(\+?212|0)[5-7]\d{8}$/.test(cleaned);
}

/** Validate a date string in YYYY-MM-DD format */
export function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const date = new Date(dateStr + 'T00:00:00');
  return !isNaN(date.getTime());
}

/** Validate a time string in HH:mm format */
export function isValidTime(timeStr: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return false;
  const [h, m] = timeStr.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

/** Validate that a date is not in the past */
export function isNotPastDate(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr >= today;
}

/** Validate a CUID-like ID format */
export function isValidId(id: string): boolean {
  return /^[a-z0-9]{20,30}$/.test(id);
}

/** Validate that a string doesn't exceed max length */
export function isWithinLength(str: string, max: number): boolean {
  return str.length <= max;
}

/** Validate service duration is reasonable */
export function isValidDuration(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes >= 15 && minutes <= 480;
}

/** Validate price is reasonable */
export function isValidPrice(price: number): boolean {
  return typeof price === 'number' && price >= 0 && price <= 100000 && Number.isFinite(price);
}

/** Validate appointment status */
export function isValidStatus(status: string): boolean {
  return ['pending', 'confirmed', 'completed', 'cancelled'].includes(status);
}

/** Validate file extension against allowlist */
export function isAllowedImageExtension(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(ext || '');
}

/** Sanitize a filename: remove path traversal and dangerous characters */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\./g, '')           // Remove path traversal
    .replace(/[/\\]/g, '')          // Remove slashes
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace other special chars
    .replace(/\.{2,}/g, '.')        // Remove multiple dots
    .substring(0, 255);             // Limit length
}

/** Validate image MIME type by checking file magic bytes */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; detectedType: string | null } {
  if (buffer.length < 4) {
    return { valid: false, detectedType: null };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, detectedType: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { valid: true, detectedType: 'image/png' };
  }

  // WebP: 52 49 46 46 ... 57 45 42 50
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer.length >= 12 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return { valid: true, detectedType: 'image/webp' };
  }

  // AVIF: starts with ftyp box containing 'avif'
  if (buffer.length >= 12) {
    const ftypStr = buffer.toString('ascii', 4, 12);
    if (ftypStr.includes('ftyp') && ftypStr.includes('avif')) {
      return { valid: true, detectedType: 'image/avif' };
    }
  }

  return { valid: false, detectedType: null };
}

/**
 * Comprehensive booking request validation.
 * Returns an error message string or null if valid.
 */
export function validateBookingRequest(body: Record<string, unknown>): string | null {
  const { serviceId, date, startTime, customerName, customerPhone, customerEmail } = body;

  if (!serviceId || typeof serviceId !== 'string') {
    return 'Service requis';
  }

  if (!date || typeof date !== 'string' || !isValidDate(date as string)) {
    return 'Date invalide';
  }

  if (!isNotPastDate(date as string)) {
    return 'Impossible de réserver dans le passé';
  }

  if (!startTime || typeof startTime !== 'string' || !isValidTime(startTime as string)) {
    return 'Heure invalide';
  }

  if (!customerName || typeof customerName !== 'string' || (customerName as string).trim().length < 2) {
    return 'Nom requis (minimum 2 caractères)';
  }

  if (!isWithinLength(customerName as string, 100)) {
    return 'Nom trop long (maximum 100 caractères)';
  }

  if (!customerPhone || typeof customerPhone !== 'string') {
    return 'Téléphone requis';
  }

  if (!isValidPhone(customerPhone as string)) {
    return 'Numéro de téléphone invalide';
  }

  if (customerEmail && typeof customerEmail === 'string' && !isValidEmail(customerEmail)) {
    return 'Adresse email invalide';
  }

  return null;
}
