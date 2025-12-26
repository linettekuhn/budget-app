import { TransactionFormData } from "@/types";
import { Options, RRule } from "rrule";

export default function buildRRule(
  data: Extract<TransactionFormData, { isRecurring: true }>
) {
  const startDate = data.date;
  const year = startDate.getUTCFullYear();
  const month = startDate.getUTCMonth();
  const day = startDate.getUTCDate();
  const hours = startDate.getUTCHours();
  const minutes = startDate.getUTCMinutes();
  const seconds = startDate.getUTCSeconds();
  const utcStartDate = new Date(year, month, day, hours, minutes, seconds);

  // build RRULE options object
  const rruleOptions: Partial<Options> = {
    freq: data.frequency,
    interval: Number(data.interval),
    dtstart: utcStartDate,
  };

  switch (data.frequency) {
    case RRule.WEEKLY:
      rruleOptions.byweekday = data.weekday;
      break;
    case RRule.MONTHLY:
      rruleOptions.bymonthday = Number(data.monthDay);
      break;
    case RRule.YEARLY:
      rruleOptions.bymonth = Number(data.yearMonth);
      rruleOptions.bymonthday = Number(data.monthDay);
      break;
  }

  // create rrule instance with options
  return new RRule(rruleOptions);
}
