import DatabaseService from "@/services/DatabaseService";
import { Salary } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { Toast } from "toastify-react-native";

export function useSalary() {
  const [reloadFlag, setReloadFlag] = useState(false);
  const [salary, setSalary] = useState<Salary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSalary = useCallback(async () => {
    try {
      const data = await DatabaseService.getSalary();
      if (data) {
        const salary: Salary = {
          id: data.id,
          type: data.type,
          amount: data.amount,
          monthly: data.monthly,
          hoursPerWeek: data.hoursPerWeek,
        };
        setSalary(salary);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error occurred loading categories",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSalary();
  }, [loadSalary]);

  useEffect(() => {
    loadSalary();
  }, [reloadFlag, loadSalary]);

  const reload = useCallback(() => setReloadFlag((flag) => !flag), []);

  const updateSalary = useCallback(
    async (
      type: string,
      amount: number,
      monthly: number,
      hoursPerWeek: number | null
    ) => {
      try {
        await DatabaseService.updateSalary(type, amount, monthly, hoursPerWeek);
        reload();
        Toast.show({
          type: "success",
          text1: "Salary updated!",
        });
      } catch (error: unknown) {
        Toast.show({
          type: "error",
          text1:
            error instanceof Error
              ? error.message
              : "An error occurred updating salary",
        });
      }
    },
    [reload]
  );

  return { salary, loading, setSalary, reload, updateSalary };
}
