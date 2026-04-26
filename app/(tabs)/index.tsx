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
import { useSalary } from "@/hooks/useSalary";
import DatabaseService from "@/services/DatabaseService";
import { registerPushToken } from "@/services/NotificationService";
import { syncBudgetWidget } from "@/utils/syncBudgetWidget";
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
  const { salary, loading: loadingSalary, reload: reloadSalary } = useSalary();
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
        console.log("syncing widget begin");
        await syncBudgetWidget();
        console.log("syncing widget end");

        const spentPercent = await DatabaseService.getSpentPercentFirstHalf();

        const weeklySpent = await DatabaseService.getWeeklySpent();

        const currentStreak = await DatabaseService.getStreak();
        //await pingBackend(user.uid, spentPercent, weeklySpent, currentStreak);
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

    if (salary) {
      const difference = salary.monthly - totalBudget;
      const isOverBudget = difference < 0;
      setOverBudget(isOverBudget);
      const saved = Number(Math.max(0, difference).toFixed(2));
      const deficit = Number(Math.abs(Math.min(0, difference)).toFixed(2));
      setDifference(isOverBudget ? deficit : saved);
    }
  }, [salary, budgets, totalBudget]);

  return (
    <AnimatedScreen>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <ScrollView contentContainerStyle={styles.container}>
          {!loadingSalary &&
            !loadingBudgets &&
            !loadingCurrency &&
            budgets &&
            salary && (
              <ThemedView style={styles.main}>
                <View>
                  <ThemedText type="displayLarge">Monthly Report</ThemedText>
                  <ThemedText type="h6">
                    Here&apos;s a quick look at where your money went and what
                    you kept!
                  </ThemedText>
                </View>
                <View>
                  <ThemedView style={styles.pieChartWrapper}>
                    <SalaryBreakdownPieChart
                      budgets={budgets}
                      salary={salary}
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
});
