import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isYesterday, isTomorrow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date | null | undefined, fmt = 'd MMM yyyy') {
  if (!value) return '—';
  const d = typeof value === 'string' ? parseISO(value) : value;
  return format(d, fmt, { locale: es });
}

export function formatDateTime(value: string | Date | null | undefined) {
  return formatDate(value, "d MMM yyyy 'a las' HH:mm");
}

export function smartDate(value: string | Date | null | undefined) {
  if (!value) return '—';
  const d = typeof value === 'string' ? parseISO(value) : value;
  if (isToday(d)) return 'Hoy';
  if (isYesterday(d)) return 'Ayer';
  if (isTomorrow(d)) return 'Mañana';
  return format(d, "d MMM", { locale: es });
}

export function relativeTime(value: string | Date | null | undefined) {
  if (!value) return '';
  const d = typeof value === 'string' ? parseISO(value) : value;
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

export function initials(name: string | null | undefined) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

export function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === 'hecha') return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

export function generateOrderRef(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `CE-${year}-${random}`;
}
