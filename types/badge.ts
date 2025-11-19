export type BadgeDefinition = {
  key: string;
  title: string;
  description: string;
  icon: string;
  criteria_type: BadgeCriteriaType;
  criteria_value?: number | string;
};

export type BadgeCriteriaType =
  | "first_transaction"
  | "stayed_under_budget"
  | "saved_over_percent"
  | "spent_over_percent_wants"
  | "created_category"
  | "consecutive_months_under_budget"
  | "top_category"
  | "needs_over_wants"
  | "exact_budget_match"
  | "zero_spend_category";
