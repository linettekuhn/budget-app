import { useOnboarding } from "@/components/context/onboarding-provider";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AmountDisplay from "@/components/ui/amount-display";
import AnimatedScreen from "@/components/ui/animated-screen";
import CapsuleButton from "@/components/ui/capsule-button";
import OnboardingControls from "@/components/ui/onboarding-controls";
import { Colors, getTheme } from "@/constants/theme";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import { formatAmountDisplay } from "@/utils/formatDisplay";
import { formatMoney } from "@/utils/formatMoney";
import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  useColorScheme,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BudgetOnboarding() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[getTheme(colorScheme)].secondary[500];
  const router = useRouter();

  // get onboarding state's budgets
  const { state, setState } = useOnboarding();
  const categories = state.categories;
  const currency = state.currency;
  const [total, setTotal] = useState(0);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!categories.length) return;

    setState((prev) => {
      const newBudgets = { ...prev.budgets };

      // remove budgets for unselected categories
      Object.keys(newBudgets).forEach((budgetId) => {
        const categoryExists = categories.some((cat) => cat.id === budgetId);
        if (!categoryExists) {
          delete newBudgets[budgetId];
        }
      });

      // initalize budgets for new categories
      categories.forEach((cat) => {
        if (!newBudgets[cat.id]) {
          const budget = cat.budget ?? 0;
          const raw = Math.round(budget * 100).toString();
          const display = formatAmountDisplay(raw);
          newBudgets[cat.id] = { raw, display };
        }
      });

      return { ...prev, budgets: newBudgets };
    });
  }, [categories, setState]);

  const handleAmountChange = (categoryId: string, text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    const formatted = formatAmountDisplay(numeric);

    setState((prev) => ({
      ...prev,
      budgets: {
        ...prev.budgets,
        [categoryId]: { raw: numeric, display: formatted },
      },
    }));
  };

  useEffect(() => {
    const totalRaw = Object.values(state.budgets).reduce((sum, { raw }) => {
      const value = parseFloat((Number(raw) / 100).toFixed(2));
      return sum + value;
    }, 0);

    setTotal(totalRaw);

    const validBudgets = categories.every((cat) => {
      const rawValue = Number(state.budgets[cat.id]?.raw || "0");
      return rawValue >= 100;
    });

    setIsValid(validBudgets);
  }, [state.budgets, categories]);

  return (
    <AnimatedScreen entering="slideRight">
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: Colors[getTheme(colorScheme)].background },
        ]}
      >
        <OnboardingControls />
        <ThemedView style={styles.container}>
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <ThemedView style={styles.header}>
              <ThemedText type="h1">Set Your Monthly Budgets</ThemedText>
              <ThemedText type="h5" style={{ paddingHorizontal: 20 }}>
                Decide how much you want to spend in each category.
              </ThemedText>
            </ThemedView>
          </TouchableWithoutFeedback>

          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={300}
            enableOnAndroid={true}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => {
              const categoryColor = adjustColorForScheme(
                category.color,
                colorScheme,
              );
              return (
                <ThemedView
                  style={[
                    styles.categoryBudget,
                    { borderColor: categoryColor },
                  ]}
                  key={category.id}
                >
                  <ThemedText type="bodyLarge">{category.name}</ThemedText>
                  <AmountDisplay
                    displayAmount={
                      state.budgets[category.id]?.display || "0.00"
                    }
                    rawAmount={state.budgets[category.id]?.raw || "0"}
                    onChangeText={(text) =>
                      handleAmountChange(category.id, text)
                    }
                    textType="bodyLarge"
                    currency={currency}
                  />
                </ThemedView>
              );
            })}
          </KeyboardAwareScrollView>

          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <ThemedView style={styles.footer}>
              <ThemedText type="h4">
                Total:{" "}
                {formatMoney({ amount: total, decimals: true, code: currency })}
              </ThemedText>
              {!isValid ? (
                <ThemedText
                  type="overline"
                  style={{
                    color: Colors[getTheme(colorScheme)].error,
                    textAlign: "center",
                  }}
                >
                  All budgets must be at least{" "}
                  {formatMoney({ amount: 1, code: currency })}
                </ThemedText>
              ) : (
                <CapsuleButton
                  text="Next"
                  iconName="arrow-right"
                  IconComponent={Octicons}
                  bgFocused={btnColor}
                  onPress={() => router.push("/salary")}
                />
              )}
            </ThemedView>
          </TouchableWithoutFeedback>
        </ThemedView>
      </SafeAreaView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  header: {
    gap: 8,
  },
  footer: {
    gap: 12,
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 20,
    gap: 20,
  },

  categoriesScroll: {
    flex: 1,
  },

  categoriesContent: {
    gap: 10,
    paddingBottom: 8,
  },

  categoryBudget: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 25,
    borderWidth: 1,
    width: "100%",
  },
});
