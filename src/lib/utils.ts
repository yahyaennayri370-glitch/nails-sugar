/**
 * Parse a time string "HH:mm" to minutes since midnight.
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convert minutes since midnight to "HH:mm" format.
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date string for short display.
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get today's date in YYYY-MM-DD.
 */
export function getToday(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get tomorrow's date in YYYY-MM-DD.
 */
export function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

/**
 * Get the start of the current week (Monday).
 */
export function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

/**
 * Get the end of the current week (Sunday).
 */
export function getWeekEnd(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

/**
 * Status labels in French.
 */
export const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

/**
 * Status colors for badges.
 */
export const STATUS_COLORS: Record<string, string> = {
  pending: '#d4a574',
  confirmed: '#7ba05b',
  completed: '#5b8ca0',
  cancelled: '#a05b5b',
};

/**
 * Day names in French.
 */
export const DAY_NAMES = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];

/**
 * Sanitize a string for safe storage.
 */
export function sanitize(str: string): string {
  return str
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Format price display.
 */
export function formatPrice(price: number | null, priceOnDemand: boolean): string {
  if (priceOnDemand || price === null || price === undefined) {
    return 'Prix sur demande';
  }
  return `${price.toFixed(0)} MAD`;
}

/**
 * Format duration display.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

/**
 * Generate available time slots for a given date and service duration,
 * considering availability, breaks, blocked times, and existing appointments.
 */
export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  serviceDuration: number,
  breaks: { startTime: string; endTime: string }[],
  blockedSlots: { startTime: string; endTime: string }[],
  existingAppointments: { startTime: string; endTime: string }[],
  slotInterval: number = 30
): string[] {
  const open = timeToMinutes(openTime);
  const close = timeToMinutes(closeTime);
  const slots: string[] = [];

  for (let t = open; t + serviceDuration <= close; t += slotInterval) {
    const slotStart = t;
    const slotEnd = t + serviceDuration;

    // Check if slot overlaps with any break
    const overlapsBreak = breaks.some((b) => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return slotStart < bEnd && slotEnd > bStart;
    });
    if (overlapsBreak) continue;

    // Check if slot overlaps with any blocked time
    const overlapsBlocked = blockedSlots.some((b) => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return slotStart < bEnd && slotEnd > bStart;
    });
    if (overlapsBlocked) continue;

    // Check if slot overlaps with any existing appointment
    const overlapsAppt = existingAppointments.some((a) => {
      const aStart = timeToMinutes(a.startTime);
      const aEnd = timeToMinutes(a.endTime);
      return slotStart < aEnd && slotEnd > aStart;
    });
    if (overlapsAppt) continue;

    slots.push(minutesToTime(slotStart));
  }

  return slots;
}
