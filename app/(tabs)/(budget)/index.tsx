import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AnimatedScreen from "@/components/ui/animated-screen";
import CapsuleButton from "@/components/ui/capsule-button";
import CategoryBudgetPreview from "@/components/ui/category-budget-preview";
import CustomCategory from "@/components/ui/modal/category-modal";
import MonthSelect from "@/components/ui/month-select";
import MonthlyBudgetPieChart from "@/components/ui/pie-chart/monthly-budget-pie-chart";
import { Colors } from "@/constants/theme";
import { useCategoriesSpend } from "@/hooks/useCategoriesSpend";
import { useCurrency } from "@/hooks/useCurrency";
import { useModal } from "@/hooks/useModal";
import { CategorySpend } from "@/types";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import { formatMoney } from "@/utils/formatMoney";
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
  const bgColor = Colors[colorScheme ?? "light"].background;
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];
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
    }, [reloadSpend, reloadCurrency])
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
  const otherTotalSpent = other
    .reduce((sum, category) => sum + category.totalSpent, 0)
    .toFixed(2);

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
      />
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
                    <ThemedText type="captionLarge">
                      {formatMoney({ code: currency, amount: totalSpent })} /{" "}
                      {formatMoney({ code: currency, amount: totalBudget })}
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
                        currency={currency ?? "USD"}
                      />
                    );
                  })}
                {!seeAll && other.length > 0 && (
                  <CategoryBudgetPreview
                    key={-1}
                    category={{
                      id: "",
                      name: "Other",
                      budget: otherTotal,
                      totalSpent: Number(otherTotalSpent),
                      color: adjustColorForScheme("#B6B6B6", colorScheme),
                      type: "need",
                    }}
                    onPress={() => setSeeAll(true)}
                    currency={currency ?? "USD"}
                  />
                )}
                {seeAll &&
                  other.length > 0 &&
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
                          currency={currency ?? "USD"}
                        />
                      );
                    })}
                <CapsuleButton
                  onPress={handleOpen}
                  text="ADD NEW CATEGORY"
                  bgFocused={btnColor}
                  IconComponent={Octicons}
                  iconName="plus"
                />
              </ThemedView>
              {seeAll && other.length > 0 && (
                <Pressable
                  style={{ alignSelf: "center" }}
                  onPress={() => setSeeAll(false)}
                >
                  <ThemedText type="link">See Less Categories</ThemedText>
                </Pressable>
              )}
              {!seeAll && other.length > 0 && (
                <Pressable
                  style={{ alignSelf: "center" }}
                  onPress={() => setSeeAll(true)}
                >
                  <ThemedText type="link">See More Categories</ThemedText>
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
