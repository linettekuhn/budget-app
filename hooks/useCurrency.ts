import DatabaseService from "@/services/DatabaseService";
import { useCallback, useEffect, useState } from "react";
import { Toast } from "toastify-react-native";

export function useCurrency() {
  const [currency, setCurrency] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [reloadFlag, setReloadFlag] = useState(false);

  const loadCurrency = useCallback(async () => {
    try {
      const savedCurrency = await DatabaseService.getCurrency();
      setCurrency(savedCurrency);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error occurred loading currency",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(() => setReloadFlag((flag) => !flag), []);

  const updateCurrency = useCallback(
    async (newCurrency: string) => {
      try {
        await DatabaseService.updateCurrency(newCurrency);
        reload();
        Toast.show({
          type: "success",
          text1: "Currency updated!",
        });
      } catch (error: unknown) {
        Toast.show({
          type: "error",
          text1:
            error instanceof Error
              ? error.message
              : "An error occurred updating currency",
        });
      }
    },
    [reload]
  );

  useEffect(() => {
    loadCurrency();
  }, [loadCurrency]);

  useEffect(() => {
    loadCurrency();
  }, [reloadFlag]);

  return {
    currency,
    loading,
    reload,
    setCurrency,
    updateCurrency,
  };
}
