import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AnimatedScreen from "@/components/ui/animated-screen";
import CategoryBudgetPreview from "@/components/ui/category-budget-preview";
import SalaryBreakdownPieChart from "@/components/ui/pie-chart/salary-breakdown-pie-chart";
import { Colors } from "@/constants/theme";
import { useCategoriesSpend } from "@/hooks/useCategoriesSpend";
import { useSalary } from "@/hooks/useSalary";
import { formatCompactNumber } from "@/utils/formatCompactNumber";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  const bgColor = Colors[colorScheme ?? "light"].background;
  const textColor = Colors[colorScheme ?? "light"].text;
  const { salary, loading: loadingSalary, reload: reloadSalary } = useSalary();
  const {
    budgets,
    loading: loadingBudgets,
    reload: reloadSpend,
  } = useCategoriesSpend();
  const [difference, setDifference] = useState("0.00");
  const [overBudget, setOverBudget] = useState(false);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useFocusEffect(
    useCallback(() => {
      reloadSpend();
      reloadSalary();
    }, [reloadSpend, reloadSalary])
  );

  // TODO: adjust saved if overflow in spending
  useEffect(() => {
    const spent = [...budgets].reduce(
      (sum, budget) => sum + budget.totalSpent,
      0
    );
    const budget = [...budgets].reduce((sum, budget) => sum + budget.budget, 0);
    setTotalSpent(Number(spent.toFixed(2)));
    setTotalBudget(Number(budget.toFixed(2)));

    if (salary) {
      const difference = salary.monthly - totalBudget;
      const isOverBudget = difference < 0;
      setOverBudget(isOverBudget);
      const saved = Math.max(0, difference);
      const deficit = Math.abs(Math.min(0, difference));
      setDifference(formatCompactNumber(isOverBudget ? deficit : saved));
    }
  }, [salary, budgets, totalBudget]);

  if (loadingSalary || loadingBudgets || !budgets || !salary) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <AnimatedScreen>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <ScrollView contentContainerStyle={styles.container}>
          <ThemedView style={styles.main}>
            <View>
              <ThemedText type="displayLarge">Monthly Report</ThemedText>
              <ThemedText type="h6">
                Here&apos;s a quick look at where your money went and what you
                kept!
              </ThemedText>
            </View>
            <View>
              <ThemedView style={styles.pieChartWrapper}>
                <SalaryBreakdownPieChart budgets={budgets} salary={salary} />
                <View style={styles.savedWrapper}>
                  <ThemedText type="displayMedium" style={styles.percent}>
                    ${difference}
                  </ThemedText>
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
                      color: Colors[colorScheme ?? "light"].error,
                      textAlign: "center",
                    }}
                  >
                    This budget exceeds your current salary!
                  </ThemedText>
                  <ThemedText
                    type="captionSmall"
                    style={{
                      color: Colors[colorScheme ?? "light"].error,
                      textAlign: "center",
                    }}
                  >
                    Consider adjusting your budgets or salary to start saving.
                  </ThemedText>
                </View>
              )}
            </View>
            <View
              style={[
                styles.spendingTrackerWrapper,
                {
                  backgroundColor: Colors[colorScheme ?? "light"].primary[200],
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
                  color: Colors[colorScheme ?? "light"].primary[500],
                  type: "need",
                }}
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
