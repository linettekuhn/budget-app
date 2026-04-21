import DatabaseService from "@/services/DatabaseService";
import { CategorySpend } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useCategoriesSpend(selectedDate?: string) {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<CategorySpend[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    let result;
    if (selectedDate) {
      const [year, month] = selectedDate.split("T")[0].split("-").map(Number);
      result = await DatabaseService.getCategoriesSpend(year, month);
    } else {
      result = await DatabaseService.getCategoriesSpend();
    }

    console.log(result);
    setBudgets(result);
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    load();
  }, []);

  return { budgets, loading, reload: load };
}
