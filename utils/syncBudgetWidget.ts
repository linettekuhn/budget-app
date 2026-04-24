import DatabaseService from "@/services/DatabaseService";
import BudgetWidget from "@/widgets/BudgetWidget";

export async function syncBudgetWidget(): Promise<void> {
  console.log("[syncBudgetWidget] called");
  try {
    const salary = await DatabaseService.getSalary();
    console.log("[syncBudgetWidget] salary:", salary);
    if (!salary) {
      console.warn("[syncBudgetWidget] no salary found, aborting");
      return;
    }

    const categoriesSpend = await DatabaseService.getCategoriesSpend();
    console.log("[syncBudgetWidget] categoriesSpend:", categoriesSpend);

    const totalBudget = categoriesSpend.reduce(
      (sum, category) => sum + (category.budget ?? 0),
      0,
    );
    const totalSpent = categoriesSpend.reduce(
      (sum, category) => sum + Math.max(0, category.totalSpent),
      0,
    );
    const remaining = Math.max(0, totalBudget - totalSpent);
    const now = new Date();
    const daysLeft =
      new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() -
      now.getDate();
    const percentUsed =
      totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const currency = (await DatabaseService.getCurrency()) ?? "USD";

    const payload = {
      remaining: parseFloat(remaining.toFixed(2)),
      totalBudget: parseFloat(totalBudget.toFixed(2)),
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      percentUsed,
      daysLeft,
      currency,
    };

    console.log("[syncBudgetWidget] pushing snapshot:", payload);
    await BudgetWidget.updateSnapshot(payload);
    console.log("[syncBudgetWidget] snapshot pushed successfully");
  } catch (error) {
    console.warn("[syncBudgetWidget] failed:", error);
  }
}
