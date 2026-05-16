import {
  startOfDay,
  endOfDay,
  startOfMonth,
  startOfYear,
  subMonths,
  format,
  parseISO,
  isValid,
} from "date-fns";
import type { DateRange } from "./types";

export function currentMonthRange(): DateRange {
  return { from: startOfMonth(new Date()), to: new Date() };
}

export function lastNMonthsRange(n: number): DateRange {
  return { from: startOfDay(subMonths(new Date(), n)), to: new Date() };
}

export function yearToDateRange(): DateRange {
  return { from: startOfYear(new Date()), to: new Date() };
}

export function previousPeriodRange(current: DateRange): DateRange {
  const durationMs = current.to.getTime() - current.from.getTime();
  return {
    from: new Date(current.from.getTime() - durationMs),
    to: new Date(current.from.getTime()),
  };
}

export function formatDateParam(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseDateRangeParams(
  from: string | undefined,
  to: string | undefined
): DateRange {
  if (!from || !to) return currentMonthRange();
  const parsedFrom = parseISO(from);
  const parsedTo = endOfDay(parseISO(to));
  if (!isValid(parsedFrom) || !isValid(parsedTo)) return currentMonthRange();
  return { from: parsedFrom, to: parsedTo };
}
