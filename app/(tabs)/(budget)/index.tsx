import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CategoryBudgetPreview from "@/components/ui/category-budget-preview";
import MonthlyBudgetPieChart from "@/components/ui/monthly-budget-pie-chart";
import { Colors } from "@/constants/theme";
import { useCategoriesSpend } from "@/hooks/useCategoriesSpend";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Budget() {
  const colorScheme = useColorScheme();
  const bgColor = Colors[colorScheme ?? "light"].background;
  const router = useRouter();

  const {
    loading: loadingSpend,
    budgets,
    reload: reloadSpend,
  } = useCategoriesSpend();

  useFocusEffect(
    useCallback(() => {
      reloadSpend();
    }, [reloadSpend])
  );

  const totalBudget = budgets.reduce(
    (sum, category) => sum + category.budget,
    0
  );
  const totalSpent = budgets.reduce(
    (sum, category) => sum + category.totalSpent,
    0
  );
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  if (loadingSpend) {
    return <ActivityIndicator size="large" />;
  }

  // TODO: change month
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.main}>
          <ThemedText type="displayMedium" style={{ textAlign: "center" }}>
            Your Budget
          </ThemedText>
          <Pressable onPress={() => router.push("/monthly-transactions")}>
            <ThemedView style={styles.pieChartWrapper}>
              <MonthlyBudgetPieChart budgets={budgets} />
              <View style={styles.monthWrapper}>
                <ThemedText type="displayLarge" style={styles.month}>
                  {months[new Date().getMonth()].toUpperCase()}
                </ThemedText>
                <ThemedText type="displayMedium" style={styles.year}>
                  {new Date().getFullYear()}
                </ThemedText>
              </View>
            </ThemedView>
          </Pressable>
          <ThemedText type="h3" style={{ textAlign: "center" }}>
            ${totalSpent} / ${totalBudget}
          </ThemedText>
          {budgets
            .slice()
            .sort((a, b) => {
              const aPercent = a.totalSpent / a.budget;
              const bPercent = b.totalSpent / b.budget;
              return bPercent - aPercent;
            })
            .map((category) => {
              return (
                <CategoryBudgetPreview
                  key={category.id}
                  category={category}
                  onPress={() =>
                    router.push({
                      pathname: "/category-transactions",
                      params: { category: JSON.stringify(category) },
                    })
                  }
                />
              );
            })}
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
    paddingTop: 16,
    paddingBottom: 70,
  },

  main: {
    flex: 1,
    gap: 15,
  },

  pieChartWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  monthWrapper: {
    position: "absolute",
    alignItems: "center",
  },

  month: {
    fontFamily: "BricolageGrotesque-ExtraBold",
    margin: 0,
    lineHeight: 0,
    textAlign: "center",
  },

  year: {
    fontFamily: "BricolageGrotesque-SemiBold",
    margin: 0,
    lineHeight: 0,
    textAlign: "center",
  },
});
