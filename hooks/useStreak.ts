import DatabaseService from "@/services/DatabaseService";
import { useCallback, useEffect, useState } from "react";
import { Toast } from "toastify-react-native";

export function useStreak() {
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [reloadFlag, setReloadFlag] = useState(false);

  const loadStreak = useCallback(async () => {
    try {
      const streak = await DatabaseService.getStreak();
      setCurrentStreak(streak);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error occurred loading streak",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  useEffect(() => {
    loadStreak();
  }, [reloadFlag, loadStreak]);

  const reload = useCallback(() => setReloadFlag((flag) => !flag), []);

  return {
    currentStreak,
    loading,
    reload,
    setCurrentStreak,
  };
}
