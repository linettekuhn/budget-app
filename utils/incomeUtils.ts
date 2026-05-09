import { IncomeOccurrence, IncomeSource, PayType } from "@/types";
import { rrulestr } from "rrule";

// calculates per-ocurrence take home amount
export function derivePayAmount(
  basisType: PayType,
  basisAmount: number,
  hoursPerWeek: number | null,
): number {
  switch (basisType) {
    case "Hourly":
      return Number(((basisAmount * (hoursPerWeek ?? 0) * 52) / 26).toFixed(2));
    case "Biweekly":
      return Number(basisAmount.toFixed(2));
    case "Monthly":
      return Number(basisAmount.toFixed(2));
    case "Yearly":
      return Number((basisAmount / 12).toFixed(2));
    case "Varies":
      return Number(basisAmount.toFixed(2));
  }
}

// builds RRULE string from pay type. startDate anchors biweekly payments
export function buildPaydayRule(basisType: PayType, startDate: Date): string {
  const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  const dayAbbr = days[startDate.getDay()];

  switch (basisType) {
    case "Monthly":
    case "Yearly":
    case "Varies":
      return "FREQ=MONTHLY;INTERVAL=1";
    case "Biweekly":
    case "Hourly":
      return `FREQ=WEEKLY;INTERVAL=2;BYDAY=${dayAbbr}`;
  }
}

// helper function to format date to string
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// computes income occurrences for all active sources in a date range
export function getIncomeOccurrences(
  sources: IncomeSource[],
  from: Date,
  to: Date,
): IncomeOccurrence[] {
  const occurrences: IncomeOccurrence[] = [];

  for (const source of sources) {
    if (!source.isActive) continue;

    const sourceStart = new Date(source.startDate);
    const sourceEnd = source.endDate ? new Date(source.endDate) : null;

    const rangeStart = sourceStart > from ? sourceStart : from;
    const rangeEnd = sourceEnd && sourceEnd < to ? sourceEnd : to;

    if (rangeStart > rangeEnd) continue;

    try {
      const rule = rrulestr(source.paydayRule, { dtstart: rangeStart });
      const dates = rule.between(rangeStart, rangeEnd, true);

      for (const date of dates) {
        const dateStr = toDateString(date);
        occurrences.push({
          id: `${source.id}_${dateStr}`,
          incomeSourceId: source.id,
          date: dateStr,
          amount: source.payAmount,
          name: source.name,
        });
      }
    } catch (e) {
      console.warn(`Invalid rrule for income source ${source.id}:`, e);
    }
  }

  return occurrences;
}

// sums all income occurrences in a given month
export function getTotalIncomeForMonth(
  sources: IncomeSource[],
  year: number,
  month: number,
): number {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59);

  const occurrences = getIncomeOccurrences(sources, from, to);
  const total = occurrences.reduce((sum, o) => sum + o.amount, 0);
  return Number(total.toFixed(2));
}
