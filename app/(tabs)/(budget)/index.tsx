import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AnimatedScreen from "@/components/ui/animated-screen";
import CapsuleButton from "@/components/ui/capsule-button";
import CategoryBudgetPreview from "@/components/ui/category-budget-preview";
import CustomCategory from "@/components/ui/modal/category-modal";
import MoneyText from "@/components/ui/money-text";
import MonthSelect from "@/components/ui/month-select";
import MonthlyBudgetPieChart from "@/components/ui/pie-chart/monthly-budget-pie-chart";
import { Colors, getTheme } from "@/constants/theme";
import { useCategoriesSpend } from "@/hooks/useCategoriesSpend";
import { useCurrency } from "@/hooks/useCurrency";
import { useModal } from "@/hooks/useModal";
import { CategorySpend } from "@/types";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import Octicons from "@expo/vector-icons/Octicons";
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

export default function Budget() {
  const colorScheme = useColorScheme();
  const bgColor = Colors[getTheme(colorScheme)].background;
  const btnColor = Colors[getTheme(colorScheme)].secondary[500];
  const router = useRouter();
  const [seeAll, setSeeAll] = useState(false);
  const [budgets, setBudgets] = useState<CategorySpend[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const selectedMonth = selectedDate.toISOString();

  const {
    loading: loadingSpend,
    budgets: defaultBudgets,
    reload: reloadSpend,
  } = useCategoriesSpend(selectedMonth);
  const {
    currency,
    loading: loadingCurrency,
    reload: reloadCurrency,
  } = useCurrency();

  useEffect(() => {
    setBudgets(defaultBudgets);
  }, [defaultBudgets]);

  useFocusEffect(
    useCallback(() => {
      reloadSpend();
      reloadCurrency();
    }, [reloadSpend, reloadCurrency]),
  );

  let totalBudget = budgets.reduce((sum, category) => sum + category.budget, 0);
  totalBudget =
    totalBudget % 2 === 0 ? totalBudget : Number(totalBudget.toFixed(2));

  let totalSpent = budgets.reduce(
    (sum, category) => sum + category.totalSpent,
    0,
  );
  totalSpent =
    totalSpent % 2 === 0 ? totalSpent : Number(totalSpent.toFixed(2));

  const sortedBudgets = [...budgets].sort((a, b) => b.budget - a.budget);

  // Only group into Other when there are more than 4 categories
  const useGrouping = sortedBudgets.length > 4;
  const topThree = useGrouping ? sortedBudgets.slice(0, 3) : sortedBudgets;
  const other = useGrouping ? sortedBudgets.slice(3) : [];

  const otherTotal = other.reduce((sum, category) => sum + category.budget, 0);
  const otherTotalSpent = Number(
    other.reduce((sum, category) => sum + category.totalSpent, 0).toFixed(2),
  );

  const sortBySpendPercent = (a: CategorySpend, b: CategorySpend) => {
    const aPercent = a.totalSpent / a.budget;
    const bPercent = b.totalSpent / b.budget;
    return bPercent - aPercent;
  };

  const updateMonthData = (date: Date) => {
    setSelectedDate(date);
  };

  const { openModal, closeModal } = useModal();

  const handleOpen = () => {
    openModal(
      <CustomCategory
        onComplete={() => {
          closeModal();
          reloadSpend();
        }}
      />,
    );
  };

  return (
    <AnimatedScreen>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <ScrollView contentContainerStyle={styles.container}>
          {!loadingSpend && !loadingCurrency && (
            <ThemedView style={styles.main}>
              <Pressable onPress={() => router.push("/monthly-transactions")}>
                <ThemedView style={styles.pieChartWrapper}>
                  <MonthlyBudgetPieChart budgets={budgets} />
                  <View style={styles.monthWrapper}>
                    <MoneyText
                      variant="pair"
                      amount={totalSpent}
                      secondAmount={totalBudget}
                      currency={currency ?? "USD"}
                      decimals
                      type="captionLarge"
                      minimumFontScale={0.2}
                    />
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
                  .sort(sortBySpendPercent)
                  .map((category) => (
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
                      currency={currency ?? "USD"}
                    />
                  ))}

                {useGrouping && !seeAll && other.length > 0 && (
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
                    currency={currency ?? "USD"}
                  />
                )}

                {useGrouping &&
                  seeAll &&
                  other.length > 0 &&
                  other
                    .slice()
                    .sort(sortBySpendPercent)
                    .map((category) => (
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
                        currency={currency ?? "USD"}
                      />
                    ))}

                <CapsuleButton
                  onPress={handleOpen}
                  text="ADD NEW CATEGORY"
                  bgFocused={btnColor}
                  IconComponent={Octicons}
                  iconName="plus"
                />
              </ThemedView>

              {useGrouping && other.length > 0 && (
                <Pressable
                  style={{ alignSelf: "center" }}
                  onPress={() => setSeeAll((prev) => !prev)}
                >
                  <ThemedText type="link">
                    {seeAll ? "See Less Categories" : "See More Categories"}
                  </ThemedText>
                </Pressable>
              )}
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
    width: 160,
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
