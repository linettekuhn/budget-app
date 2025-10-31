import { ThemedView } from "@/components/themed-view";
import CapsuleButton from "@/components/ui/capsule-button";
import CategoryBudgetPreview from "@/components/ui/category-budget-preview";
import { Colors } from "@/constants/theme";
import { useCategoriesSpend } from "@/hooks/useCategoriesSpend";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Budget() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];
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

  if (loadingSpend) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.main}>
          <CapsuleButton
            text="MONTHLY TRANSACTIONS"
            onPress={() => router.push("/monthly-transactions")}
            bgFocused={btnColor}
          />
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
    paddingVertical: 16,
  },

  main: {
    paddingVertical: 30,
    flex: 1,
    gap: 20,
  },
});
