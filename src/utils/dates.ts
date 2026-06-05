import { TimelineGranularity } from '../entities/Payment';

export function getTimelinePeriod(dateValue: string, granularity: TimelineGranularity): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return 'invalid-date';

  if (granularity === 'month') {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  if (granularity === 'week') {
    const monday = getUtcMonday(date);
    return monday.toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function getUtcMonday(date: Date): Date {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() - day + 1);
  return copy;
}
