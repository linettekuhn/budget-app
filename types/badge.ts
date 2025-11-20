export type BadgeDefinition = {
  key: string;
  title: string;
  description: string;
  criteria_type: BadgeCriteriaType;
  criteria_value?: number | string;
};

export type BadgeType = {
  key: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlocked_at: Date;
};

export type AwardedBadge = {
  badge_key: string;
  unlocked: number;
  unlocked_at: string;
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
