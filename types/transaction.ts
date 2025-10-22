export type Transaction = {
  id: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  date: Date;
};
