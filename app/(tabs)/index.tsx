import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AnimatedScreen from "@/components/ui/animated-screen";
import CategoryBudgetPreview from "@/components/ui/category-budget-preview";
import MoneyText from "@/components/ui/money-text";
import SalaryBreakdownPieChart from "@/components/ui/pie-chart/salary-breakdown-pie-chart";
import { Colors, getTheme } from "@/constants/theme";
import { auth } from "@/firebase/firebaseConfig";
import { useCategoriesSpend } from "@/hooks/useCategoriesSpend";
import { useCurrency } from "@/hooks/useCurrency";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import DatabaseService from "@/services/DatabaseService";
import { pingBackend, registerPushToken } from "@/services/NotificationService";
import WidgetService from "@/services/WidgetService";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const bgColor = Colors[getTheme(colorScheme)].background;
  const {
    sources,
    loading: loadingSalary,
    reload: reloadSalary,
    getMonthlyTotal,
  } = useIncomeSources();
  const {
    budgets,
    loading: loadingBudgets,
    reload: reloadSpend,
  } = useCategoriesSpend();
  const {
    currency,
    loading: loadingCurrency,
    reload: reloadCurrency,
  } = useCurrency();
  const [difference, setDifference] = useState(0);
  const [overBudget, setOverBudget] = useState(false);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useFocusEffect(
    useCallback(() => {
      reloadSpend();
      reloadSalary();
      reloadCurrency();

      const user = auth.currentUser;
      if (!user) {
        console.log("no user");
        return;
      }

      const ping = async () => {
        await WidgetService.syncAll();

        const spentPercent = await DatabaseService.getSpentPercentFirstHalf();

        const weeklySpent = await DatabaseService.getWeeklySpent();

        const currentStreak = await DatabaseService.getStreak();
        await pingBackend(user.uid, spentPercent, weeklySpent, currentStreak);
      };

      ping();
    }, [reloadSpend, reloadSalary, reloadCurrency]),
  );

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    registerPushToken(user.uid);
  });

  useEffect(() => {
    const spent = [...budgets].reduce(
      (sum, budget) => sum + budget.totalSpent,
      0,
    );
    const budget = [...budgets].reduce((sum, budget) => sum + budget.budget, 0);
    setTotalSpent(Number(spent.toFixed(2)));
    setTotalBudget(Number(budget.toFixed(2)));

    const now = new Date();
    const monthlyIncome = getMonthlyTotal(
      now.getFullYear(),
      now.getMonth() + 1,
    );

    if (monthlyIncome > 0) {
      const diff = monthlyIncome - budget;
      const isOver = diff < 0;
      setOverBudget(isOver);
      setDifference(
        isOver
          ? Number(Math.abs(diff).toFixed(2))
          : Number(Math.max(0, diff).toFixed(2)),
      );
    }
  }, [sources, getMonthlyTotal, budgets, totalBudget]);

  return (
    <AnimatedScreen>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <ScrollView contentContainerStyle={styles.container}>
          {!loadingSalary &&
            !loadingBudgets &&
            !loadingCurrency &&
            budgets && (
              <ThemedView style={styles.main}>
                {sources.length > 0 ? (
                  <>
                    <View>
                      <ThemedText type="displayLarge">Monthly Report</ThemedText>
                      <ThemedText type="h6">
                        Here&apos;s a quick look at where your money went and
                        what you kept!
                      </ThemedText>
                    </View>
                    <View>
                      <ThemedView style={styles.pieChartWrapper}>
                        <SalaryBreakdownPieChart
                          budgets={budgets}
                          monthlyIncome={getMonthlyTotal(
                            new Date().getFullYear(),
                            new Date().getMonth() + 1,
                          )}
                        />
                        <View style={styles.savedWrapper}>
                          <MoneyText
                            variant="hero"
                            amount={difference}
                            currency={currency ?? "USD"}
                            type="displayMedium"
                            style={styles.percent}
                            minimumFontScale={0.4}
                          />
                          <ThemedText type="h5" style={styles.saved}>
                            {overBudget ? "short!" : "saved!"}
                          </ThemedText>
                        </View>
                      </ThemedView>
                      {overBudget && (
                        <View>
                          <ThemedText
                            type="overline"
                            style={{
                              color: Colors[getTheme(colorScheme)].error,
                              textAlign: "center",
                            }}
                          >
                            This budget exceeds your current salary!
                          </ThemedText>
                          <ThemedText
                            type="captionSmall"
                            style={{
                              color: Colors[getTheme(colorScheme)].error,
                              textAlign: "center",
                            }}
                          >
                            Consider adjusting your budgets or salary to start
                            saving.
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyState}>
                    <ThemedText type="displayLarge">Welcome!</ThemedText>
                    <ThemedText type="h6">
                      Add your income to see your monthly budget breakdown and
                      how much you&apos;re saving.
                    </ThemedText>
                    <Pressable
                      onPress={() => router.push("/(tabs)/(profile)")}
                    >
                      <ThemedText type="link">
                        Add Income Source →
                      </ThemedText>
                    </Pressable>
                  </View>
                )}
                <View
                  style={[
                    styles.spendingTrackerWrapper,
                    {
                      backgroundColor:
                        Colors[getTheme(colorScheme)].primary[200],
                    },
                  ]}
                >
                  <ThemedText type="displayMedium">Spending Tracker</ThemedText>
                  <CategoryBudgetPreview
                    onPress={() => {
                      router.push("/(tabs)/(budget)");
                    }}
                    category={{
                      id: "",
                      name: "Total Spent",
                      budget: totalBudget,
                      totalSpent: totalSpent,
                      color: Colors[getTheme(colorScheme)].primary[500],
                      type: "need",
                    }}
                    currency={currency ?? "USD"}
                  />
                  <Pressable
                    onPress={() => {
                      router.push("/(tabs)/(budget)");
                    }}
                  >
                    <ThemedText type="link" style={{ textAlign: "center" }}>
                      Check your monthly budget →
                    </ThemedText>
                  </Pressable>
                </View>
              </ThemedView>
            )}
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  main: {
    flex: 1,
    gap: 30,
  },

  pieChartWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  savedWrapper: {
    position: "absolute",
    alignItems: "center",
    width: 150,
  },

  percent: {
    fontFamily: "Onest-ExtraBold",
    margin: 0,
    lineHeight: 0,
    textAlign: "center",
  },

  saved: {
    fontFamily: "Onest-SemiBold",
    margin: 0,
    lineHeight: 0,
    textAlign: "center",
  },

  legend: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 15,
  },

  spendingTrackerWrapper: {
    borderRadius: 20,
    gap: 20,
    padding: 16,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 16,
  },
});
