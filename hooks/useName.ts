import DatabaseService from "@/services/DatabaseService";
import { useCallback, useEffect, useState } from "react";
import { Toast } from "toastify-react-native";

export function useName() {
  const [name, setName] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [reloadFlag, setReloadFlag] = useState(false);

  const loadName = useCallback(async () => {
    try {
      const savedName = await DatabaseService.getName();
      setName(savedName);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error occurred loading name",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadName();
  }, [loadName]);

  useEffect(() => {
    loadName();
  }, [reloadFlag, loadName]);

  const reload = useCallback(() => setReloadFlag((flag) => !flag), []);

  return {
    name,
    loading,
    reload,
    setName,
  };
}
