export type CategoryType = {
  id: number;
  uuid: string;
  name: string;
  color: string;
  budget: number;
  type: string;
};

export type CategorySpend = {
  id: number;
  name: string;
  color: string;
  budget: number;
  totalSpent: number;
  type: string;
};
