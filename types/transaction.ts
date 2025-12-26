import { Frequency, Weekday } from "rrule";

export type TransactionType = {
  id: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  categoryId: string;
  categoryColor?: string;
  categoryName?: string;
};

export type RecurringTransaction = {
  id: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  categoryId: string;
  rrule: string;
  lastGenerated: string;
};

export type BaseTransactionFormData = {
  name: string;
  rawAmount: string;
  type: "INCOME" | "EXPENSE" | "";
  categoryId: string;
  date: Date;
};

export type RecurringFormData = {
  isRecurring: true;
  interval: string;
  frequency: Frequency;
  weekday: Weekday;
  monthDay: number;
  yearMonth: number;
};

export type NonRecurringFormData = {
  isRecurring: false;
};

export type TransactionFormData =
  | (BaseTransactionFormData & NonRecurringFormData)
  | (BaseTransactionFormData & RecurringFormData);

export type TransactionFormInitial = Partial<BaseTransactionFormData> & {
  recurrence: Partial<RecurringFormData>;
};
