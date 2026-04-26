import { Colors } from "@/constants/theme";
import { formatMoney } from "@/utils/formatMoney";
import BudgetWidget from "@/widgets/BudgetWidget";
import DatabaseService from "./DatabaseService";

const estimateWidth = (str: string): number => {
  let width = 0;
  for (const char of str) {
    if ("MW%".includes(char))
      width += 1.4; // wide
    else if (".,: ".includes(char))
      width += 0.4; // narrow
    else if ("1il|".includes(char))
      width += 0.6; // slim digits
    else width += 1;
  }
  return width;
};

const heroFontSize = (formatted: string, isSmall: boolean): number => {
  const w = estimateWidth(formatted);
  const base = isSmall ? 20 : 34;
  if (w <= 7) return base;
  if (w <= 10) return Math.round(base * 0.85);
  if (w <= 13) return Math.round(base * 0.7);
  return Math.round(base * 0.6);
};

export default class WidgetService {
  static async syncBudgetWidget(): Promise<void> {
    try {
      const salary = await DatabaseService.getSalary();
      if (!salary) return;

      const currency = (await DatabaseService.getCurrency()) ?? "USD";
      const categoriesSpend = await DatabaseService.getCategoriesSpend();

      const totalBudget = categoriesSpend.reduce(
        (sum, c) => sum + (c.budget ?? 0),
        0,
      );
      const totalSpent = categoriesSpend.reduce(
        (sum, c) => sum + Math.max(0, c.totalSpent),
        0,
      );
      const remaining = totalBudget - totalSpent;

      const now = new Date();
      const daysLeft =
        new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() -
        now.getDate();
      const dailyRemaining =
        daysLeft > 0 && remaining > 0
          ? parseFloat((remaining / daysLeft).toFixed(2))
          : 0;

      const fmt = (amount: number) =>
        formatMoney({ code: currency, amount, decimals: false });

      const monthName = now.toLocaleString("default", { month: "long" });
      const formattedRemaining = fmt(Math.abs(remaining));

      const payload = {
        remainingFormatted: fmt(Math.abs(remaining)),
        totalBudgetFormatted: fmt(totalBudget),
        dailyRemainingFormatted: dailyRemaining > 0 ? fmt(dailyRemaining) : "",
        isOverBudget: remaining < 0,
        noBudgetSet: totalBudget === 0,
        daysLeft,
        monthName,
        colors: Colors,
        heroFontSizeSmall: heroFontSize(formattedRemaining, true),
        heroFontSizeLarge: heroFontSize(formattedRemaining, false),
      };
      console.log(
        "[WidgetService.syncBudgetWidget] syncing with payload:",
        payload,
      );
      await BudgetWidget.updateSnapshot(payload);
    } catch (error) {
      console.warn("[WidgetService.syncBudgetWidget]", error);
    }
  }

  static async syncAll(): Promise<void> {
    await Promise.all([this.syncBudgetWidget()]);
  }
}
