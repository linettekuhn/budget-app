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
