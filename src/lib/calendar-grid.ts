import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parse,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";

export function parseMonthParam(param: string | undefined): Date {
  if (param) {
    const parsed = parse(param, "yyyy-MM", new Date());
    if (isValid(parsed)) return startOfMonth(parsed);
  }
  return startOfMonth(new Date());
}

export function monthParam(date: Date): string {
  return format(date, "yyyy-MM");
}

export function monthLabel(date: Date): string {
  const label = format(date, "MMMM yyyy", { locale: fr });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function previousMonth(date: Date): Date {
  return addMonths(date, -1);
}

export function nextMonth(date: Date): Date {
  return addMonths(date, 1);
}

export function monthRange(date: Date): { start: Date; end: Date } {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

export function buildMonthGrid(date: Date): Date[][] {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export const weekdayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
