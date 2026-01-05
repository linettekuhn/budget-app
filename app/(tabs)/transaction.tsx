import AnimatedScreen from "@/components/ui/animated-screen";
import CapsuleButton from "@/components/ui/capsule-button";
import TransactionForm from "@/components/ui/transaction-form";
import { Colors } from "@/constants/theme";
import { useBadgeCheck } from "@/hooks/useBadgeCheck";
import DatabaseService from "@/services/DatabaseService";
import { TransactionFormData } from "@/types";
import buildRRule from "@/utils/buildRRule";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  useColorScheme,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function Transaction() {
  const params = useLocalSearchParams<{
    type: "INCOME" | "EXPENSE" | "";
    reset?: string;
  }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { checkBadges } = useBadgeCheck();
  const [formData, setFormData] = useState<TransactionFormData | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const btnColor = Colors[colorScheme ?? "light"].secondary[500];

  const handleTransaction = async () => {
    if (!formData) return;
    try {
      if (
        !formData.rawAmount ||
        !formData.name ||
        !formData.type ||
        !formData.categoryId
      ) {
        throw new Error("All fields are required");
      }
      if (parseFloat(formData.rawAmount) === 0)
        throw new Error("Amount cannot be 0");

      const transaction = {
        name: formData.name.trim(),
        amount: parseFloat((Number(formData.rawAmount) / 100).toFixed(2)),
        type: formData.type.toLowerCase() as "income" | "expense",
        categoryId: formData.categoryId,
        date: formData.date.toISOString(),
      };

      if (formData.isRecurring) {
        if (!formData.interval || Number(formData.interval) < 1) {
          throw new Error("Interval must be at least 1");
        }

        const rrule = buildRRule(formData);

        // compute most recent recurrence date
        const lastDate = rrule.before(new Date(), true);

        if (lastDate) {
          transaction.date = lastDate.toISOString();
        }

        await DatabaseService.addRecurringTransaction({
          ...transaction,
          rrule: rrule.toString(),
        });
        Toast.show({
          type: "success",
          text1: "Recurring transaction added!",
        });
      } else {
        await DatabaseService.addTransaction(transaction);
        Toast.show({
          type: "success",
          text1: "Transaction added!",
        });
      }

      await checkBadges();

      router.setParams({});
      setFormData(null);
      setResetKey((prev) => prev + 1);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error ocurred saving transaction",
        });
      }
    }
  };

  if (!params.type) {
    return null;
  }

  return (
    <AnimatedScreen>
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: Colors[colorScheme ?? "light"].background },
        ]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={Platform.OS === "ios" ? 80 : 100}
            enableOnAndroid={true}
            contentContainerStyle={styles.container}
          >
            <TransactionForm
              key={`${params.reset || "default"}-${resetKey}`}
              onChange={setFormData}
              initial={
                params.type ? { type: params.type, recurrence: {} } : undefined
              }
            />
            <CapsuleButton
              text="ADD TRANSACTION"
              onPress={() => {
                Keyboard.dismiss();
                handleTransaction();
              }}
              bgFocused={btnColor}
            />
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
    paddingTop: 16,
    paddingBottom: 70,
  },

  main: {
    paddingVertical: 30,
    flex: 1,
    gap: 15,
  },

  amountWrapper: {
    width: "100%",
    height: 100,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    position: "relative",
  },

  amountInput: {
    textAlign: "center",
    padding: 0,
    margin: 0,
    zIndex: 1,
  },

  heading: {
    marginVertical: 10,
    marginHorizontal: "auto",
  },

  options: {
    flexDirection: "column",
    alignItems: "center",
  },

  horizontalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 8,
  },
});
