import {
  addDays,
  differenceInMinutes,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek
} from 'date-fns';

export const todayKey = () => format(new Date(), 'yyyy-MM-dd');
export const nowTime = () => format(new Date(), 'HH:mm');
export const toDateKey = (date: Date) => format(date, 'yyyy-MM-dd');
export const toDisplayDate = (date: string) => format(parseISO(date), 'M월 d일');

export function minutesBetween(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const start = sh * 60 + sm;
  let end = eh * 60 + em;
  if (end < start) end += 24 * 60;
  return Math.max(0, end - start);
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export function weekRange(date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
}

export function monthRange(date = new Date()) {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

export function dateKeysBetween(start: Date, end: Date): string[] {
  const keys: string[] = [];
  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    keys.push(toDateKey(cursor));
  }
  return keys;
}

export function inDateRange(dateKey: string, start: Date, end: Date): boolean {
  return isWithinInterval(parseISO(dateKey), { start, end });
}

export function sleepMinutesForDay(records: { category: string; durationMinutes: number }[]) {
  return records.filter((record) => record.category === 'sleep').reduce((sum, record) => sum + record.durationMinutes, 0);
}

export { differenceInMinutes };
