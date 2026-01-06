import { Colors } from "@/constants/theme";
import { useCurrency } from "@/hooks/useCurrency";
import { useModal } from "@/hooks/useModal";
import { useSalary } from "@/hooks/useSalary";
import { Salary } from "@/types";
import { formatAmountDisplay } from "@/utils/formatDisplay";
import { formatMoney } from "@/utils/formatMoney";
import { useEffect, useState } from "react";
import { Keyboard, StyleSheet, useColorScheme, View } from "react-native";
import { Toast } from "toastify-react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";
import AmountDisplay from "../ui/amount-display";
import CapsuleNumberInput from "../ui/capsule-input-number";
import CapsuleToggle from "../ui/capsule-toggle";
import SettingsModal from "../ui/modal/settings-modal";
import ProfileOption from "./profile-option";

function SalaryChangeContent({
  initialSalary,
  onSave,
  onCancel,
  currency,
}: {
  initialSalary: Salary;
  onSave: (name: Salary) => Promise<void>;
  onCancel: () => void;
  currency: string;
}) {
  const colorScheme = useColorScheme();
  const [salaryType, setSalaryType] = useState<
    "Hourly" | "Biweekly" | "Monthly" | "Yearly" | "Varies"
  >(initialSalary.type || "Hourly");
  const [hoursRaw, setHoursRaw] = useState(
    Math.round((initialSalary.hoursPerWeek || 0) * 100).toString()
  );
  const [hoursDisplay, setHoursDisplay] = useState(
    formatAmountDisplay(hoursRaw)
  );
  const [rawAmount, setRawAmount] = useState(
    Math.round(initialSalary.amount * 100).toString() || "0"
  );
  const [displayAmount, setDisplayAmount] = useState(
    formatAmountDisplay(rawAmount)
  );
  const [monthlyAmount, setMonthlyAmount] = useState(initialSalary.monthly);

  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    setRawAmount(numeric);
    const formatted = formatAmountDisplay(numeric);
    setDisplayAmount(formatted);
  };

  useEffect(() => {
    const hours = parseFloat((Number(hoursRaw) / 100).toFixed(2));
    const amount = parseFloat((Number(rawAmount) / 100).toFixed(2));
    switch (salaryType) {
      case "Hourly":
        setMonthlyAmount(amount * hours * 4.33);
        break;
      case "Biweekly":
        setMonthlyAmount(amount * 2);
        break;
      case "Monthly":
        setMonthlyAmount(amount);
        break;
      case "Yearly":
        setMonthlyAmount(amount / 12);
        break;
      case "Varies":
        setMonthlyAmount(amount);
        break;
    }
  }, [rawAmount, hoursRaw, salaryType]);

  const handleHoursChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    setHoursRaw(numeric);
    const formatted = formatAmountDisplay(numeric);
    setHoursDisplay(formatted);
  };

  const saveSalary = async () => {
    try {
      if (!rawAmount || parseFloat(rawAmount) < 1) {
        throw new Error(
          `Amount must be at least ${formatMoney({
            code: currency,
            amount: 1,
          })}`
        );
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

      const newSalary: Salary = {
        id: "primary_salary",
        type: salaryType,
        amount,
        monthly: Number(monthlySalary.toFixed(2)),
        hoursPerWeek: salaryType === "Hourly" ? hours : 0,
      };

      await onSave(newSalary);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error ocurred while saving",
        });
      }
    }
  };

  return (
    <SettingsModal
      onCancel={onCancel}
      title="Edit your salary"
      onComplete={saveSalary}
    >
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
                currency={currency}
                displayAmount={displayAmount}
                rawAmount={rawAmount}
                onChangeText={handleAmountChange}
                textType="h3"
              />
              <ThemedText type="h3"> per hour</ThemedText>
            </ThemedView>
          </View>
          <View style={{ marginVertical: 10, gap: 5, alignItems: "center" }}>
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
              currency={currency}
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
              currency={currency}
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
              currency={currency}
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
              currency={currency}
              displayAmount={displayAmount}
              rawAmount={rawAmount}
              onChangeText={handleAmountChange}
              textType="h3"
            />
            <ThemedText type="h3"> per month (estimated)</ThemedText>
          </ThemedView>
        </ThemedView>
      )}
      <ThemedText type="h4">
        Monthly income: {formatMoney({ amount: monthlyAmount, code: currency })}
      </ThemedText>
    </SettingsModal>
  );
}

export default function EditSalaryOption({
  onChange,
}: {
  onChange?: () => void;
}) {
  const { openModal, closeModal } = useModal();
  const { salary, updateSalary } = useSalary();
  const { currency } = useCurrency();

  const handleSalaryEdit = () => {
    openModal(
      <SalaryChangeContent
        initialSalary={
          salary ?? {
            id: "primary_salary",
            type: "Hourly",
            amount: 0,
            monthly: 0,
            hoursPerWeek: 0,
          }
        }
        onSave={async (newSalary: Salary) => {
          await updateSalary(
            newSalary.type,
            newSalary.amount,
            newSalary.monthly,
            newSalary.hoursPerWeek ?? null
          );

          if (onChange) {
            onChange();
          }

          closeModal();
        }}
        onCancel={closeModal}
        currency={currency ?? "USD"}
      />
    );
  };

  return <ProfileOption text="Edit salary" onPress={handleSalaryEdit} />;
}

const styles = StyleSheet.create({
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
