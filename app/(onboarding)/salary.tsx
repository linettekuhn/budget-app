import { useOnboarding } from "@/components/context/onboarding-provider";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AmountDisplay from "@/components/ui/amount-display";
import CapsuleButton from "@/components/ui/capsule-button";
import CapsuleNumberInput from "@/components/ui/capsule-input-number";
import CapsuleToggle from "@/components/ui/capsule-toggle";
import TextButton from "@/components/ui/text-button";
import { Colors } from "@/constants/theme";
import { formatAmountDisplay } from "@/utils/formatDisplay";
import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function SalaryOnboarding() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];
  const router = useRouter();

  // get onboarding state's budgets
  const { state, setState } = useOnboarding();
  const salary = state.salary;

  const [salaryType, setSalaryType] = useState<
    "Hourly" | "Biweekly" | "Monthly" | "Yearly" | "Varies"
  >(salary.type || "Hourly");
  const [hoursRaw, setHoursRaw] = useState(
    Math.round((salary.hoursPerWeek || 0) * 100).toString()
  );
  const [hoursDisplay, setHoursDisplay] = useState(
    formatAmountDisplay(hoursRaw)
  );
  const [rawAmount, setRawAmount] = useState(
    Math.round(salary.amount * 100).toString() || "0"
  );
  const [displayAmount, setDisplayAmount] = useState(
    formatAmountDisplay(rawAmount)
  );

  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    setRawAmount(numeric);
    const formatted = formatAmountDisplay(numeric);
    setDisplayAmount(formatted);
  };

  const handleHoursChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    setHoursRaw(numeric);
    const formatted = formatAmountDisplay(numeric);
    setHoursDisplay(formatted);
  };

  const saveSalary = async () => {
    try {
      if (!rawAmount || parseFloat(rawAmount) < 1) {
        throw new Error("Amount must be at least $1.00");
      }

      if (
        salaryType === "Hourly" &&
        (!hoursRaw || parseFloat(hoursRaw) === 0)
      ) {
        throw new Error("Hours cannot be 0");
      }

      let monthlySalary = 0;
      const hours = parseFloat((Number(hoursRaw) / 100).toFixed(2));
      const amount = parseFloat((Number(rawAmount) / 100).toFixed(2));

      switch (salaryType) {
        case "Hourly":
          monthlySalary = amount * hours * 4.33;
          break;
        case "Biweekly":
          monthlySalary = amount * 2;
          break;
        case "Monthly":
          monthlySalary = amount;
          break;
        case "Yearly":
          monthlySalary = amount / 12;
          break;
        case "Varies":
          monthlySalary = amount;
          break;
      }

      setState((prev) => ({
        ...prev,
        salary: {
          type: salaryType,
          amount,
          monthly: Number(monthlySalary.toFixed(2)),
          hoursPerWeek: salaryType === "Hourly" ? hours : 0,
        },
      }));

      router.push("/finish");
    } catch (error: unknown) {
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error ocurred while completing onboarding",
        });
      }
    }
  };
  return (
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
          <ThemedView style={styles.main}>
            <TextButton
              text="Back"
              iconName="arrow-left"
              IconComponent={Octicons}
              onPress={() => router.back()}
            />
            <ThemedText type="h1">Add Your Income</ThemedText>
            <ThemedText type="h4">
              Entering your salary helps us calculate savings.
            </ThemedText>
            <ThemedText type="h3">How do you usually get paid?</ThemedText>

            <ThemedView style={styles.horizontalContainer}>
              <CapsuleToggle
                text={"Hourly"}
                bgFocused={Colors[colorScheme ?? "light"].primary[500]}
                selected={salaryType === "Hourly"}
                onPress={() => {
                  Keyboard.dismiss();
                  setSalaryType("Hourly");
                }}
              />
              <CapsuleToggle
                text={"Biweekly"}
                bgFocused={Colors[colorScheme ?? "light"].primary[500]}
                selected={salaryType === "Biweekly"}
                onPress={() => {
                  Keyboard.dismiss();
                  setSalaryType("Biweekly");
                }}
              />
              <CapsuleToggle
                text={"Monthly"}
                bgFocused={Colors[colorScheme ?? "light"].primary[500]}
                selected={salaryType === "Monthly"}
                onPress={() => {
                  Keyboard.dismiss();
                  setSalaryType("Monthly");
                }}
              />
              <CapsuleToggle
                text={"Yearly"}
                bgFocused={Colors[colorScheme ?? "light"].primary[500]}
                selected={salaryType === "Yearly"}
                onPress={() => {
                  Keyboard.dismiss();
                  setSalaryType("Yearly");
                }}
              />
              <CapsuleToggle
                text={"Varies"}
                bgFocused={Colors[colorScheme ?? "light"].primary[500]}
                selected={salaryType === "Varies"}
                onPress={() => {
                  Keyboard.dismiss();
                  setSalaryType("Varies");
                }}
              />
            </ThemedView>
            {salaryType === "Hourly" && (
              <ThemedView style={styles.hourlyWrapper}>
                <View style={styles.quantityWrapper}>
                  <ThemedText type="h2">How much?</ThemedText>
                  <ThemedView style={styles.salaryAmount}>
                    <AmountDisplay
                      displayAmount={displayAmount}
                      rawAmount={rawAmount}
                      onChangeText={handleAmountChange}
                      textType="h3"
                    />
                    <ThemedText type="h3"> per hour</ThemedText>
                  </ThemedView>
                </View>
                <View
                  style={{ marginVertical: 10, gap: 5, alignItems: "center" }}
                >
                  <ThemedText type="overline">
                    Enter your best average if it varies
                  </ThemedText>
                  <ThemedView style={styles.salaryAmount}>
                    <CapsuleNumberInput
                      displayAmount={hoursDisplay}
                      rawAmount={hoursRaw}
                      onChangeText={handleHoursChange}
                      textType="h3"
                    />
                    <ThemedText type="h3"> hours per week</ThemedText>
                  </ThemedView>
                </View>
              </ThemedView>
            )}
            {salaryType === "Biweekly" && (
              <ThemedView style={styles.quantityWrapper}>
                <ThemedText type="h2">How much?</ThemedText>
                <ThemedView style={styles.salaryAmount}>
                  <AmountDisplay
                    displayAmount={displayAmount}
                    rawAmount={rawAmount}
                    onChangeText={handleAmountChange}
                    textType="h3"
                  />
                  <ThemedText type="h3"> every 2 weeks</ThemedText>
                </ThemedView>
              </ThemedView>
            )}
            {salaryType === "Monthly" && (
              <ThemedView style={styles.quantityWrapper}>
                <ThemedText type="h2">How much?</ThemedText>
                <ThemedView style={styles.salaryAmount}>
                  <AmountDisplay
                    displayAmount={displayAmount}
                    rawAmount={rawAmount}
                    onChangeText={handleAmountChange}
                    textType="h3"
                  />
                  <ThemedText type="h3"> per month</ThemedText>
                </ThemedView>
              </ThemedView>
            )}
            {salaryType === "Yearly" && (
              <ThemedView style={styles.quantityWrapper}>
                <ThemedText type="h2">How much?</ThemedText>
                <ThemedView style={styles.salaryAmount}>
                  <AmountDisplay
                    displayAmount={displayAmount}
                    rawAmount={rawAmount}
                    onChangeText={handleAmountChange}
                    textType="h3"
                  />
                  <ThemedText type="h3"> per year</ThemedText>
                </ThemedView>
              </ThemedView>
            )}
            {salaryType === "Varies" && (
              <ThemedView style={styles.quantityWrapper}>
                <ThemedText type="h2">How much?</ThemedText>
                <ThemedView style={styles.salaryAmount}>
                  <AmountDisplay
                    displayAmount={displayAmount}
                    rawAmount={rawAmount}
                    onChangeText={handleAmountChange}
                    textType="h3"
                  />
                  <ThemedText type="h3"> per month (estimated)</ThemedText>
                </ThemedView>
              </ThemedView>
            )}

            <CapsuleButton
              text="Next"
              iconName="arrow-right"
              IconComponent={Octicons}
              bgFocused={btnColor}
              onPress={saveSalary}
            />
          </ThemedView>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
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

  horizontalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },

  salaryAmount: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  hourlyWrapper: {
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 10,
  },

  quantityWrapper: {
    marginVertical: 10,
    alignItems: "center",
  },
});
