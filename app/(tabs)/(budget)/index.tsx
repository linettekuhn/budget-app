import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CategoryBudgetPreview from "@/components/ui/category-budget-preview";
import MonthSelect from "@/components/ui/month-select";
import MonthlyBudgetPieChart from "@/components/ui/pie-chart/monthly-budget-pie-chart";
import { Colors } from "@/constants/theme";
import { useCategoriesSpend } from "@/hooks/useCategoriesSpend";
import { CategorySpend } from "@/types";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
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

export default function Budget() {
  const colorScheme = useColorScheme();
  const bgColor = Colors[colorScheme ?? "light"].background;
  const router = useRouter();
  const [seeAll, setSeeAll] = useState(false);
  const [budgets, setBudgets] = useState<CategorySpend[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const selectedMonth = selectedDate.toISOString().slice(0, 7);

  const {
    loading: loadingSpend,
    budgets: defaultBudgets,
    reload: reloadSpend,
  } = useCategoriesSpend(selectedMonth);

  useEffect(() => {
    setBudgets(defaultBudgets);
  }, [defaultBudgets]);

  useFocusEffect(
    useCallback(() => {
      reloadSpend();
    }, [reloadSpend])
  );

  let totalBudget = budgets.reduce((sum, category) => sum + category.budget, 0);
  totalBudget =
    totalBudget % 2 === 0 ? totalBudget : Number(totalBudget.toFixed(2));

  let totalSpent = budgets.reduce(
    (sum, category) => sum + category.totalSpent,
    0
  );
  totalSpent =
    totalSpent % 2 === 0 ? totalSpent : Number(totalSpent.toFixed(2));

  const sortedBudgets = [...budgets].sort((a, b) => b.budget - a.budget);
  const topThree = sortedBudgets.slice(0, 3);
  const other = sortedBudgets.slice(3);

  const otherTotal = other.reduce((sum, category) => sum + category.budget, 0);
  const otherTotalSpent = other.reduce(
    (sum, category) => sum + category.totalSpent,
    0
  );

  const updateMonthData = (date: Date) => {
    setSelectedDate(date);
  };

  if (loadingSpend) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.main}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/monthly-transactions",
                params: { date: JSON.stringify(selectedDate) },
              })
            }
          >
            <ThemedView style={styles.pieChartWrapper}>
              <MonthlyBudgetPieChart budgets={budgets} />
              <View style={styles.monthWrapper}>
                <ThemedText type="captionLarge">
                  ${totalSpent} / ${totalBudget}
                </ThemedText>
                <MonthSelect
                  handleDateChange={updateMonthData}
                  initialDate={selectedDate}
                />
              </View>
            </ThemedView>
          </Pressable>

          <ThemedView style={styles.categoryPreviews}>
            {topThree
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
                        params: {
                          category: JSON.stringify(category),
                          date: JSON.stringify(selectedDate),
                        },
                      })
                    }
                  />
                );
              })}
            {!seeAll && (
              <CategoryBudgetPreview
                key={-1}
                category={{
                  id: "",
                  name: "Other",
                  budget: otherTotal,
                  totalSpent: otherTotalSpent,
                  color: adjustColorForScheme("#B6B6B6", colorScheme),
                  type: "need",
                }}
                onPress={() => setSeeAll(true)}
              />
            )}
            {seeAll &&
              other
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
                          params: {
                            category: JSON.stringify(category),
                            date: JSON.stringify(selectedDate),
                          },
                        })
                      }
                    />
                  );
                })}
          </ThemedView>
          {seeAll ? (
            <Pressable
              style={{ alignSelf: "center" }}
              onPress={() => setSeeAll(false)}
            >
              <ThemedText type="link">See Less Categories</ThemedText>
            </Pressable>
          ) : (
            <Pressable
              style={{ alignSelf: "center" }}
              onPress={() => setSeeAll(true)}
            >
              <ThemedText type="link">See More Categories</ThemedText>
            </Pressable>
          )}
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
    gap: 20,
  },

  pieChartWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  monthWrapper: {
    position: "absolute",
    alignItems: "center",
    gap: -15,
  },

  month: {
    fontSize: 50,
    lineHeight: 0,
  },

  year: {
    fontFamily: "Onest-SemiBold",
    fontSize: 30,
    lineHeight: 0,
  },

  categoryPreviews: {
    gap: 8,
  },
});
