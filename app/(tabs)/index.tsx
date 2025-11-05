import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CategoryBudgetPreview from "@/components/ui/category-budget-preview";
import SalaryBreakdownPieChart from "@/components/ui/salary-breakdown-pie-chart";
import { Colors } from "@/constants/theme";
import { useCategoriesSpend } from "@/hooks/useCategoriesSpend";
import { useSalary } from "@/hooks/useSalary";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  const [saved, setSaved] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useFocusEffect(
    useCallback(() => {
      reloadSpend();
    }, [reloadSpend])
  );

  useEffect(() => {
    const spent = [...budgets].reduce(
      (sum, budget) => sum + budget.totalSpent,
      0
    );
    const budget = [...budgets].reduce((sum, budget) => sum + budget.budget, 0);
    setTotalSpent(spent);
    setTotalBudget(budget);

    if (salary) {
      const saved = salary.monthly - spent;
      const savedPercent = saved / salary.monthly;
      setSaved(savedPercent);
    }
  }, [salary, budgets]);

  const wantsColor = adjustColorForScheme("#53C772", colorScheme);
  const needsColor = adjustColorForScheme("#1A9FE0", colorScheme);
  const savedColor = adjustColorForScheme("#E99A1B", colorScheme, 10);

  if (loadingSalary || loadingBudgets || !budgets || !salary) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.main}>
          <ThemedText type="displayMedium" style={{ textAlign: "center" }}>
            Your Salary Breakdown
          </ThemedText>
          <ThemedView style={styles.pieChartWrapper}>
            <SalaryBreakdownPieChart budgets={budgets} salary={salary} />
            <View style={styles.savedWrapper}>
              <ThemedText type="displayLarge" style={styles.percent}>
                {Math.round(saved * 100).toString()}%
              </ThemedText>
              <ThemedText type="displayMedium" style={styles.saved}>
                saved!
              </ThemedText>
            </View>
          </ThemedView>
          <ThemedView style={styles.legend}>
            <View
              style={[
                styles.capsuleLegendItem,
                { backgroundColor: wantsColor },
              ]}
            >
              <ThemedText type="overline">Wants</ThemedText>
            </View>
            <View
              style={[
                styles.capsuleLegendItem,
                { backgroundColor: needsColor },
              ]}
            >
              <ThemedText type="overline">Needs</ThemedText>
            </View>
            <View
              style={[
                styles.capsuleLegendItem,
                { backgroundColor: savedColor },
              ]}
            >
              <ThemedText type="overline">Saved</ThemedText>
            </View>
          </ThemedView>
          <CategoryBudgetPreview
            onPress={() => {
              router.push("/(tabs)/(budget)");
            }}
            category={{
              id: -1,
              name: "Monthly Budget",
              budget: totalBudget,
              totalSpent: totalSpent,
              color: Colors[colorScheme ?? "light"].primary[500],
              type: "need",
            }}
          />
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
    paddingVertical: 30,
    flex: 1,
    gap: 15,
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
    fontFamily: "BricolageGrotesque-ExtraBold",
    margin: 0,
    lineHeight: 0,
    textAlign: "center",
  },

  saved: {
    fontFamily: "BricolageGrotesque-SemiBold",
    margin: 0,
    lineHeight: 0,
    textAlign: "center",
  },

  legend: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 15,
  },

  capsuleLegendItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
  },
});
