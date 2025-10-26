export type TransactionType = {
  id: number;
  name: string;
  amount: number;
  type: "income" | "expense";
  categoryId: number;
  date: string;
};
