import badgesJson from "@/assets/data/badges.json";
import { BadgeCriteriaType, BadgeDefinition } from "@/types";
import DatabaseService from "./DatabaseService";

const badges = badgesJson as BadgeDefinition[];
type BadgeCheckHandler = (badge: BadgeDefinition) => Promise<boolean>;

function getLastMonthString(offset: number = 1) {
  const now = new Date();
  now.setDate(1);
  now.setMonth(now.getMonth() - offset);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

const badgesCheckHandlers: Record<BadgeCriteriaType, BadgeCheckHandler> = {
  first_transaction: checkFirstTransaction,
  stayed_under_budget: checkStayedUnderBudget,
  saved_over_percent: checkSavedOverPercent,
  spent_over_percent_wants: checkSpentOverPercentWants,
  created_category: checkCreatedCategory,
  consecutive_months_under_budget: checkConsecutiveMonths,
  top_category: checkTopCategory,
  needs_over_wants: checkNeedsOverWants,
  exact_budget_match: checkExactBudgetMatch,
  zero_spend_category: checkZeroSpendInCategory,
};

export class BadgeService {
  static async checkBadges() {
    for (const badge of badges) {
      const handler = badgesCheckHandlers[badge.criteria_type];
      if (!handler) continue;

      const award = await handler(badge);
      if (award) {
        // TODO: badge earned message
        const result = await DatabaseService.unlockBadge(badge.key);
        console.log(`Badge earned: ${badge.title}`, result);
      }
    }
  }
}

async function checkFirstTransaction(badge: BadgeDefinition) {
  if (await DatabaseService.checkBadgeUnlocked(badge.key)) {
    return false;
  }
  // check transactions count
  const transactions = await DatabaseService.getAllTransactions();

  // if count > 0 return true
  if (transactions.length > 0) {
    return true;
  } else {
    return false;
  }
}

async function checkStayedUnderBudget(badge: BadgeDefinition) {
  // check if badge already earned
  if (await DatabaseService.checkBadgeUnlocked(badge.key)) {
    return false;
  }

  if (badge.criteria_value === null || badge.criteria_value === undefined) {
    throw Error("Missing criteria value");
  }

  if (typeof badge.criteria_value !== "number") {
    throw Error("Criteria value must be number");
  }

  /// check if month has fully passed
  const monthsSince = await DatabaseService.monthsSinceAppStart();
  if (!monthsSince || monthsSince < 1) {
    return false;
  }

  // get budgets from last month
  const lastMonth = getLastMonthString();
  const budgets = await DatabaseService.getCategoriesSpend(lastMonth);

  // check sum of spend and total budget
  const totalSpent = budgets.reduce(
    (sum, budget) => sum + budget.totalSpent,
    0
  );
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budget, 0);

  // require at least some spending to award badge
  if (totalSpent === 0) {
    return false;
  }

  // if budget > sum return true
  return totalBudget > totalSpent;
}

async function checkSavedOverPercent(badge: BadgeDefinition) {
  // check if badge already earned
  if (await DatabaseService.checkBadgeUnlocked(badge.key)) {
    return false;
  }

  if (badge.criteria_value === null || badge.criteria_value === undefined) {
    throw Error("Missing criteria value");
  }

  if (typeof badge.criteria_value !== "number") {
    throw Error("Criteria value must be number");
  }

  // check if month has fully passed
  const monthsSince = await DatabaseService.monthsSinceAppStart();
  if (!monthsSince || monthsSince < 1) {
    return false;
  }

  // get budgets from last month
  const lastMonth = getLastMonthString();
  const budgets = await DatabaseService.getCategoriesSpend(lastMonth);

  // get salary
  const salary = await DatabaseService.getSalary();
  if (!salary) {
    throw Error("No salary was found");
  }

  const totalSpent = budgets.reduce(
    (sum, budget) => sum + budget.totalSpent,
    0
  );

  // require at least some spending to award badge
  if (totalSpent === 0) {
    return false;
  }

  // check sum of saved and total income
  const totalSaved = salary.monthly - totalSpent;
  const savedPercent = totalSaved / salary.monthly;

  // if sum > badge.criteria_value% of budget return true
  if (savedPercent > badge.criteria_value) {
    return true;
  } else {
    return false;
  }
}

async function checkSpentOverPercentWants(badge: BadgeDefinition) {
  // check if badge already earned
  if (await DatabaseService.checkBadgeUnlocked(badge.key)) {
    return false;
  }

  if (badge.criteria_value === null || badge.criteria_value === undefined) {
    throw Error("Missing criteria value");
  }

  if (typeof badge.criteria_value !== "number") {
    throw Error("Criteria value must be number");
  }

  // check if month has fully passed
  const monthsSince = await DatabaseService.monthsSinceAppStart();
  if (!monthsSince || monthsSince < 1) {
    return false;
  }

  // get budgets from last month
  const lastMonth = getLastMonthString();
  const budgets = await DatabaseService.getCategoriesSpend(lastMonth);

  // get salary
  const salary = await DatabaseService.getSalary();
  if (!salary) {
    throw Error("No salary was found");
  }

  // check sum of spent on 'want' categories
  const totalSpentWants = budgets.reduce((sum, budget) => {
    return budget.type === "want" ? sum + budget.totalSpent : sum;
  }, 0);
  // require at least some spending to award badge
  if (totalSpentWants === 0) {
    return false;
  }

  // check sum of total income for month
  const spentPercent = totalSpentWants / salary.monthly;

  // if spent_on_wants / total_income > badge.criteria_value return true
  return spentPercent > badge.criteria_value;
}

async function checkCreatedCategory(badge: BadgeDefinition) {
  // check if badge already earned
  if (await DatabaseService.checkBadgeUnlocked(badge.key)) {
    return false;
  }

  // check count of categories created by the user (is_default = 0)
  // if count >= badge.criteria_value return true
  return await DatabaseService.checkCustomCategoryCreated();
}

async function checkConsecutiveMonths(badge: BadgeDefinition) {
  // check if badge already earned
  if (await DatabaseService.checkBadgeUnlocked(badge.key)) {
    return false;
  }

  if (badge.criteria_value === null || badge.criteria_value === undefined) {
    throw Error("Missing criteria value");
  }

  if (typeof badge.criteria_value !== "number") {
    throw Error("Criteria value must be number");
  }

  // check if months since badge.criteria_value have fully passed
  const monthsSince = await DatabaseService.monthsSinceAppStart();
  if (!monthsSince || monthsSince < badge.criteria_value) {
    return false;
  }

  // for each month since badge.criteria_value, check if spent <= budget
  for (let offset = 1; offset <= badge.criteria_value; offset++) {
    const month = getLastMonthString(offset);
    const budgets = await DatabaseService.getCategoriesSpend(month);

    // check sum of spend and total budget
    const totalSpent = budgets.reduce(
      (sum, budget) => sum + budget.totalSpent,
      0
    );
    // require at least some spending to award badge
    if (totalSpent === 0) {
      return false;
    }

    const totalBudget = budgets.reduce((sum, budget) => sum + budget.budget, 0);

    // if any month is over budget, return false
    if (totalSpent > totalBudget) {
      return false;
    }
  }
  return true;
}

async function checkTopCategory(badge: BadgeDefinition) {
  // check if badge already earned
  if (await DatabaseService.checkBadgeUnlocked(badge.key)) {
    return false;
  }

  if (badge.criteria_value === null || badge.criteria_value === undefined) {
    throw Error("Missing criteria value");
  }

  if (typeof badge.criteria_value !== "string") {
    throw Error("Criteria value must be string");
  }

  // check if month has fully passed
  const monthsSince = await DatabaseService.monthsSinceAppStart();
  if (!monthsSince || monthsSince < 1) {
    return false;
  }

  // get budgets from last month
  const lastMonth = getLastMonthString();
  const budgets = await DatabaseService.getCategoriesSpend(lastMonth);

  // determine top category by spending
  const budgetSorted = [...budgets].sort((a, b) => b.totalSpent - a.totalSpent);
  if (budgetSorted.length === 0) return false;

  // require at least some spending in top category
  if (budgetSorted[0].totalSpent === 0) {
    return false;
  }

  // if top category matches badge.criteria_value return true
  return budgetSorted[0].name === badge.criteria_value;
}

async function checkNeedsOverWants(badge: BadgeDefinition) {
  // check if badge already earned
  if (await DatabaseService.checkBadgeUnlocked(badge.key)) {
    return false;
  }

  // check if month has fully passed
  const monthsSince = await DatabaseService.monthsSinceAppStart();
  if (!monthsSince || monthsSince < 1) {
    return false;
  }

  // get budgets from last month
  const lastMonth = getLastMonthString();
  const budgets = await DatabaseService.getCategoriesSpend(lastMonth);

  // check sum of spent on 'want' categories
  const totalSpentWants = budgets.reduce((sum, budget) => {
    return budget.type === "want" ? sum + budget.totalSpent : sum;
  }, 0);

  // check sum of spent on 'needs' categories
  const totalSpentNeeds = budgets.reduce((sum, budget) => {
    return budget.type === "need" ? sum + budget.totalSpent : sum;
  }, 0);

  // require at least some spending to award badge
  if (totalSpentNeeds === 0 && totalSpentWants === 0) {
    return false;
  }

  // if sum_needs > sum_wants return true
  return totalSpentNeeds > totalSpentWants;
}

async function checkExactBudgetMatch(badge: BadgeDefinition) {
  // check if badge already earned
  if (await DatabaseService.checkBadgeUnlocked(badge.key)) {
    return false;
  }

  // check if month has fully passed
  const monthsSince = await DatabaseService.monthsSinceAppStart();
  if (!monthsSince || monthsSince < 1) {
    return false;
  }

  // get budgets from last month
  const lastMonth = getLastMonthString();
  const budgets = await DatabaseService.getCategoriesSpend(lastMonth);

  // loop through budgets
  for (const budget of budgets) {
    // check that all categories have the exact same budget as spend
    const isExact = Math.abs(budget.totalSpent - budget.budget) < 0.01;
    if (!isExact) return false;
  }
  return true;
}

async function checkZeroSpendInCategory(badge: BadgeDefinition) {
  // check if badge already earned
  if (await DatabaseService.checkBadgeUnlocked(badge.key)) {
    return false;
  }

  if (badge.criteria_value === null || badge.criteria_value === undefined) {
    throw Error("Missing criteria value");
  }

  if (typeof badge.criteria_value !== "string") {
    throw Error("Criteria value must be string");
  }

  // check if month has fully passed
  const monthsSince = await DatabaseService.monthsSinceAppStart();
  if (!monthsSince || monthsSince < 1) {
    return false;
  }

  // get budgets from last month
  const lastMonth = getLastMonthString();
  const budgets = await DatabaseService.getCategoriesSpend(lastMonth);

  // find spending in category specified in badge.criteria_value
  const foundCategory = budgets.find(
    (category) => category.name === badge.criteria_value
  );

  if (!foundCategory) {
    return false;
  }

  // check if spending is exactly 0
  return foundCategory.totalSpent === 0;
}
