import { useOnboarding } from "@/components/context/onboarding-provider";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AmountDisplay from "@/components/ui/amount-display";
import AnimatedScreen from "@/components/ui/animated-screen";
import CapsuleButton from "@/components/ui/capsule-button";
import OnboardingControls from "@/components/ui/onboarding-controls";
import { Colors } from "@/constants/theme";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import { formatAmountDisplay } from "@/utils/formatDisplay";
import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  useColorScheme,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BudgetOnboarding() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];
  const router = useRouter();

  // get onboarding state's budgets
  const { state, setState } = useOnboarding();
  const categories = state.categories;
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
          { backgroundColor: Colors[colorScheme ?? "light"].background },
        ]}
      >
        <OnboardingControls />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={Platform.OS === "ios" ? 80 : 100}
            enableOnAndroid={true}
            contentContainerStyle={styles.container}
          >
            <ThemedView style={styles.main}>
              <ThemedText type="h1">Set Your Monthly Budgets</ThemedText>
              <ThemedText type="h5" style={{ paddingHorizontal: 20 }}>
                Decide how much you want to spend in each category.
              </ThemedText>
              <ThemedView style={styles.categoriesWrapper}>
                {categories.map((category) => {
                  const categoryColor = adjustColorForScheme(
                    category.color,
                    colorScheme
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
                      />
                    </ThemedView>
                  );
                })}
              </ThemedView>
              <ThemedText type="h4">Total: ${total.toFixed(2)}</ThemedText>
              {!isValid ? (
                <ThemedText
                  type="overline"
                  style={{
                    color: Colors[colorScheme ?? "light"].error,
                    textAlign: "center",
                  }}
                >
                  All budgets must be at least $1.00
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
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
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
    paddingTop: 70,
  },

  main: {
    paddingVertical: 8,
    justifyContent: "flex-start",
    flex: 1,
    gap: 20,
  },

  categoriesWrapper: {
    gap: 10,
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
