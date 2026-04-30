export type PayType = "Hourly" | "Biweekly" | "Monthly" | "Yearly" | "Varies";

export type IncomeSource = {
  id: string;
  name: string;
  basisType: PayType;
  basisAmount: number; // what the user entered
  payAmount: number; // derived monthly take home
  paydayRule: string; // RRUle
  startDate: string;
  endDate: string | null;
  isActive: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  sourceVersion: number;
  hoursPerWeek: number | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type IncomeOccurrence = {
  id: string;
  incomeSourceId: string;
  date: string;
  amount: number;
  name: string;
};

// old salary type for migration
export type Salary = {
  id: string;
  type: "Hourly" | "Biweekly" | "Monthly" | "Yearly" | "Varies";
  amount: number;
  monthly: number;
  hoursPerWeek?: number;
};
