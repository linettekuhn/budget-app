import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
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
  const { salary, loading: loadingSalary } = useSalary();
  const {
    budgets,
    loading: loadingBudgets,
    reload: reloadSpend,
  } = useCategoriesSpend();
  const [saved, setSaved] = useState("0.00");
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useFocusEffect(
    useCallback(() => {
      reloadSpend();
    }, [reloadSpend])
  );

  // TODO: adjust saved if overflow in spending
  useEffect(() => {
    const spent = [...budgets].reduce(
      (sum, budget) => sum + budget.totalSpent,
      0
    );
    const budget = [...budgets].reduce((sum, budget) => sum + budget.budget, 0);
    setTotalSpent(spent);
    setTotalBudget(budget);

    if (salary) {
      const saved = salary.monthly - budget;
      setSaved(formatCompactNumber(saved));
    }
  }, [salary, budgets]);

  if (loadingSalary || loadingBudgets || !budgets || !salary) {
    return <ActivityIndicator size="large" />;
  }

  return (
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
          <ThemedView style={styles.pieChartWrapper}>
            <SalaryBreakdownPieChart budgets={budgets} salary={salary} />
            <View style={styles.savedWrapper}>
              <ThemedText type="displayMedium" style={styles.percent}>
                ${saved}
              </ThemedText>
              <ThemedText type="h5" style={styles.saved}>
                saved!
              </ThemedText>
            </View>
          </ThemedView>
          <View
            style={[
              styles.spendingTrackerWrapper,
              { backgroundColor: Colors[colorScheme ?? "light"].primary[200] },
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
