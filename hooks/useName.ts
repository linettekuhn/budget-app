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

  const reload = useCallback(() => setReloadFlag((flag) => !flag), []);

  const updateName = useCallback(
    async (newName: string) => {
      try {
        await DatabaseService.updateName(newName);
        reload();
        Toast.show({
          type: "success",
          text1: "Name updated!",
        });
      } catch (error: unknown) {
        Toast.show({
          type: "error",
          text1:
            error instanceof Error
              ? error.message
              : "An error occurred updating name",
        });
      }
    },
    [reload]
  );

  useEffect(() => {
    loadName();
  }, [loadName]);

  useEffect(() => {
    loadName();
  }, [reloadFlag]);

  return {
    name,
    loading,
    reload,
    setName,
    updateName,
  };
}
