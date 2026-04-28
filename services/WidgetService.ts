import { Colors } from "@/constants/theme";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import { formatMoney } from "@/utils/formatMoney";
import AddTransactionWidget from "@/widgets/AddTransactionWidget";
import BudgetWidget from "@/widgets/BudgetWidget";
import CategoryWidget from "@/widgets/CategoryWidget";
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

      await BudgetWidget.updateSnapshot(payload);
    } catch (error) {
      console.warn("[WidgetService.syncBudgetWidget]", error);
    }
  }
  static async syncCategoryWidget(): Promise<void> {
    try {
      const categoryId = await DatabaseService.getWidgetCategoryId();
      const currency = (await DatabaseService.getCurrency()) ?? "USD";
      const now = new Date();
      const daysLeft =
        new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() -
        now.getDate();

      if (!categoryId) {
        await CategoryWidget.updateSnapshot({
          noCategorySet: true,
          categoryName: "",
          categoryColor: "",
          remainingFormatted: "",
          totalBudgetFormatted: "",
          dailyRemainingFormatted: "",
          isOverBudget: false,
          noBudgetSet: false,
          daysLeft,
          monthName: now.toLocaleString("default", { month: "long" }),
          colors: Colors,
          heroFontSizeSmall: 20,
          heroFontSizeLarge: 34,
          widgetUrl: "budgetapp:///(tabs)/(profile)",
        });
        return;
      }

      const spend = await DatabaseService.getCategorySpend(categoryId);
      if (!spend) return;

      const budget = spend.budget ?? 0;
      const remaining = budget - Math.max(0, spend.totalSpent);
      const dailyRemaining =
        daysLeft > 0 && remaining > 0
          ? parseFloat((remaining / daysLeft).toFixed(2))
          : 0;

      const fmt = (amount: number) =>
        formatMoney({ code: currency, amount, decimals: false });

      const formattedRemaining = fmt(Math.abs(remaining));

      const widgetUrl = `budgetapp:///(tabs)/(budget)/category-transactions?categoryId=${spend.id}&date=${encodeURIComponent(JSON.stringify(now))}`;

      const payload = {
        noCategorySet: false,
        categoryName: spend.name,
        categoryColor: spend.color,
        remainingFormatted: formattedRemaining,
        totalBudgetFormatted: fmt(budget),
        dailyRemainingFormatted: dailyRemaining > 0 ? fmt(dailyRemaining) : "",
        isOverBudget: remaining < 0,
        noBudgetSet: budget === 0,
        daysLeft,
        monthName: now.toLocaleString("default", { month: "long" }),
        colors: Colors,
        heroFontSizeSmall: heroFontSize(formattedRemaining, true),
        heroFontSizeLarge: heroFontSize(formattedRemaining, false),
        widgetUrl,
      };

      await CategoryWidget.updateSnapshot(payload);
    } catch (error) {
      console.warn("[WidgetService.syncCategoryWidget]", error);
    }
  }

  static async syncTransactionWidget(): Promise<void> {
    try {
      const transactions = await DatabaseService.getAllTransactions();
      const currency = (await DatabaseService.getCurrency()) ?? "USD";
      let payload;

      const pillBackgroundLight =
        adjustColorForScheme(Colors.light.primary[700], "dark") + "33";
      const pillBackgroundDark =
        adjustColorForScheme(Colors.dark.primary[700], "light") + "33";

      if (transactions.length) {
        const transaction = transactions[0];
        console.log("Transaction:", transaction);

        const fmt = (amount: number) =>
          formatMoney({ code: currency, amount, decimals: false });

        const formattedAmount = fmt(Math.abs(transaction.amount));
        const heroFontSizeSmall = heroFontSize("x " + formattedAmount, true);
        const widgetUrl = `budgetapp:///(tabs)/transaction?type=${transaction.type === "income" ? "INCOME" : "EXPENSE"}`;

        payload = {
          lastTransaction: transaction,
          formattedAmount,
          heroFontSize: heroFontSizeSmall,
          categoryColor: transaction.categoryColor,
          widgetUrl,
          colors: Colors,
        };
      } else {
        const widgetUrl = "budgetapp:///(tabs)/transaction?type=EXPENSE";
        payload = {
          lastTransaction: undefined,
          formattedAmount: "",
          heroFontSize: 20,
          categoryColor: undefined,
          widgetUrl,
          colors: Colors,
        };
      }

      console.log(
        "[WidgetService.syncTransactionWidget] syncing with payload:",
        payload,
      );
      await AddTransactionWidget.updateSnapshot({
        ...payload,
        pillBackgroundLight,
        pillBackgroundDark,
      });
    } catch (error) {
      console.warn("[WidgetService.syncTransactionWidget]", error);
    }
  }

  static async syncAll(): Promise<void> {
    await Promise.all([
      this.syncBudgetWidget(),
      this.syncCategoryWidget(),
      this.syncTransactionWidget(),
    ]);
  }
}
