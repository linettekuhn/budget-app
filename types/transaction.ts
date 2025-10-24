export type TransactionType = {
  id: number;
  name: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  date: string;
};
