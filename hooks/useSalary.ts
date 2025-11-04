import { Salary } from "@/types";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export function useSalary() {
  const db = useSQLiteContext();
  const [reloadFlag, setReloadFlag] = useState(false);
  const [salary, setSalary] = useState<Salary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSalary = useCallback(async () => {
    try {
      const data = await db.getFirstAsync<Salary>("SELECT * FROM salary");
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
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("An error occurred loading categories");
      }
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadSalary();
  }, [loadSalary]);

  useEffect(() => {
    loadSalary();
  }, [reloadFlag, loadSalary]);

  const reload = useCallback(() => setReloadFlag((flag) => !flag), []);
  return { salary, loading, setSalary, reload };
}
