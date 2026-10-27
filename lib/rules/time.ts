const DAY_MS = 24 * 60 * 60 * 1000;

export function addDays(iso: string | Date, days: number): string {
  return new Date(new Date(iso).getTime() + days * DAY_MS).toISOString();
}

export function addMonths(iso: string | Date, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

export function daysBetween(from: string | Date, to: string | Date): number {
  return (new Date(to).getTime() - new Date(from).getTime()) / DAY_MS;
}

export function startOfDay(now: Date): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Weeks start on Monday 00:00 local time.
export function startOfWeek(now: Date): Date {
  const d = startOfDay(now);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d;
}
