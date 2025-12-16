import DatabaseService from "@/services/DatabaseService";
import { RecurringTransaction } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { Toast } from "toastify-react-native";

export function useRecurringTransactions() {
  const [reloadFlag, setReloadFlag] = useState(false);
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);

  const loadRecurringTransactions = useCallback(async () => {
    try {
      const data = await DatabaseService.getAllRecurringTransactions();

      const savedRecurringTransactions = data.map((row) => ({
        id: row.id,
        name: row.name,
        amount: row.amount,
        type: row.type,
        categoryId: row.categoryId,
        date: row.date,
        rrule: row.rrule,
        lastGenerated: row.lastGenerated,
      }));

      setRecurringTransactions(savedRecurringTransactions);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error occurred loading recurring transactions",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecurringTransactions();
  }, [loadRecurringTransactions]);

  useEffect(() => {
    loadRecurringTransactions();
  }, [reloadFlag, loadRecurringTransactions]);

  const reload = useCallback(() => setReloadFlag((flag) => !flag), []);
  return { recurringTransactions, loading, setRecurringTransactions, reload };
}
