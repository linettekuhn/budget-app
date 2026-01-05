import { Colors } from "@/constants/theme";
import DatabaseService from "@/services/DatabaseService";
import {
  TransactionFormData,
  TransactionFormInitial,
  TransactionType,
} from "@/types";
import { useState } from "react";
import { Alert, useColorScheme } from "react-native";
import { Toast } from "toastify-react-native";
import CapsuleButton from "./capsule-button";
import SettingsModal from "./modal/settings-modal";
import TransactionForm from "./transaction-form";

export default function EditTransaction({
  initialTransaction,
  onSave,
  onCancel,
}: {
  initialTransaction: TransactionType;
  onSave: (name: TransactionType) => Promise<void>;
  onCancel: () => void;
}) {
  const colorScheme = useColorScheme();
  const [formData, setFormData] = useState<TransactionFormData | null>(null);

  const initialFormData: TransactionFormInitial = {
    name: initialTransaction.name,
    rawAmount: Math.round(initialTransaction.amount * 100).toString(),
    type: initialTransaction.type.toUpperCase() as "INCOME" | "EXPENSE",
    categoryId: initialTransaction.categoryId,
    date: new Date(initialTransaction.date),
    recurrence: {},
  };

  const saveTransaction = async () => {
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

      const updatedTransaction = {
        ...transaction,
        id: initialTransaction.id,
      };
      return await onSave(updatedTransaction);
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

  const deleteTransaction = async () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await DatabaseService.deleteTransaction(initialTransaction.id);
              onCancel();
            } catch (error: unknown) {
              if (error instanceof Error) {
                Toast.show({
                  type: "error",
                  text1: error.message,
                });
              } else {
                Toast.show({
                  type: "error",
                  text1: "An error ocurred deleting transaction",
                });
              }
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SettingsModal
      title="Edit Recurring Transaction"
      onComplete={saveTransaction}
      onCancel={onCancel}
    >
      <CapsuleButton
        text="DELETE TRANSACTION"
        bgFocused={Colors[colorScheme ?? "light"].error}
        onPress={deleteTransaction}
      />
      <TransactionForm initial={initialFormData} onChange={setFormData} />
    </SettingsModal>
  );
}
