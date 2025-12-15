export type Salary = {
  id: string;
  type: "Hourly" | "Biweekly" | "Monthly" | "Yearly" | "Varies";
  amount: number;
  monthly: number;
  hoursPerWeek?: number;
};
