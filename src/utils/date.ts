/**
 * Date/time formatting helpers. Deliberately dependency-free — Hermes on
 * RN 0.83 ships a full `Intl` implementation, so a date library buys us
 * nothing but bundle size.
 */

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;

const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const timeFmt = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
const weekdayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
// en-GB orders as "3 Oct" (day before month) to match the spec's examples;
// en-US would render "Oct 3" instead.
const dayMonthFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

/** "Today, 18:00" · "Tomorrow, 09:30" · "Fri, 18:00" · "3 Oct, 09:00" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const dayDiff = Math.round((startOfDay(d).getTime() - startOfDay(now).getTime()) / DAY_MS);
  const time = timeFmt.format(d);

  if (dayDiff === 0) return `Today, ${time}`;
  if (dayDiff === 1) return `Tomorrow, ${time}`;
  if (dayDiff > 1 && dayDiff < 7) return `${weekdayFmt.format(d)}, ${time}`;
  if (dayDiff < 0 && dayDiff > -7) return `${weekdayFmt.format(d)}, ${time}`;
  return `${dayMonthFmt.format(d)}, ${time}`;
}

/** "2h left" · "in 3 days" · "3d overdue" · "due now" */
export function formatRelativeDeadline(iso: string, now: Date = new Date()): string {
  const diffMs = new Date(iso).getTime() - now.getTime();

  if (Math.abs(diffMs) < MINUTE_MS) return 'due now';

  if (diffMs > 0) {
    const hours = diffMs / HOUR_MS;
    if (hours < 1) {
      const minutes = Math.ceil(diffMs / MINUTE_MS);
      return `${minutes}m left`;
    }
    if (hours < 24) return `${Math.ceil(hours)}h left`;
    const days = Math.ceil(hours / 24);
    return `in ${days} day${days === 1 ? '' : 's'}`;
  }

  const absHours = -diffMs / HOUR_MS;
  if (absHours < 24) return `${Math.ceil(absHours)}h overdue`;
  const days = Math.ceil(absHours / 24);
  return `${days}d overdue`;
}

/** Rounds a Date up to the next 15-minute boundary. Used for form defaults. */
export function roundUpToQuarterHour(d: Date): Date {
  const step = 15 * MINUTE_MS;
  return new Date(Math.ceil(d.getTime() / step) * step);
}

/** true when the deadline is in the past. */
export function isOverdue(iso: string, now: Date = new Date()): boolean {
  return new Date(iso).getTime() < now.getTime();
}
