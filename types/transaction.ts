export type TransactionType = {
  id: number;
  uuid: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  categoryId: number;
  categoryColor?: string;
  categoryName?: string;
};

export type RecurringTransaction = {
  id: number;
  uuid: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  categoryId: number;
  rrule: string;
  lastGenerated: string;
};
