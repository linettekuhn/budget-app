import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AmountDisplay from "@/components/ui/amount-display";
import CapsuleButton from "@/components/ui/capsule-button";
import { Colors } from "@/constants/theme";
import { useCategories } from "@/hooks/useCategories";
import DatabaseService from "@/services/DatabaseService";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import { formatAmountDisplay } from "@/utils/formatAmountDisplay";
import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  useColorScheme,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function BudgetOnboarding() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];
  const router = useRouter();

  const { loading, categories } = useCategories();

  const [categoryAmounts, setCategoryAmounts] = useState<{
    [key: number]: { raw: string; display: string };
  }>({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!categories.length) return;

    const initial: { [key: number]: { raw: string; display: string } } = {};
    categories.forEach((cat) => {
      const budget = cat.budget ?? 0;

      const raw = Math.round(budget * 100).toString();
      const display = formatAmountDisplay(raw);

      initial[cat.id] = { raw: raw, display: display };
    });
    setCategoryAmounts(initial);
  }, [categories]);

  const handleAmountChange = (categoryId: number, text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    const formatted = formatAmountDisplay(numeric);

    setCategoryAmounts((prev) => ({
      ...prev,
      [categoryId]: { raw: numeric, display: formatted },
    }));
  };

  const saveBudgets = async () => {
    try {
      await DatabaseService.updateCategoryBudgets(categoryAmounts);
      router.push("/salary");
    } catch (error: unknown) {
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error ocurred saving budgets",
        });
      }
    }
  };

  useEffect(() => {
    const totalRaw = Object.values(categoryAmounts).reduce((sum, { raw }) => {
      const value = parseFloat((Number(raw) / 100).toFixed(2));
      return sum + value;
    }, 0);

    setTotal(totalRaw);
  }, [categoryAmounts]);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === "ios" ? 80 : 100}
        enableOnAndroid={true}
        contentContainerStyle={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                        categoryAmounts[category.id]?.display || "0.00"
                      }
                      rawAmount={categoryAmounts[category.id]?.raw || "0"}
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

            <CapsuleButton
              text="Next"
              iconName="arrow-right"
              IconComponent={Octicons}
              bgFocused={btnColor}
              onPress={saveBudgets}
            />
          </ThemedView>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
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
    paddingVertical: 10,
    justifyContent: "space-evenly",
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
