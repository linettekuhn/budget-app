import DatabaseService from "@/services/DatabaseService";
import { CategorySpend } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useCategoriesSpend(month?: string) {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<CategorySpend[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await DatabaseService.getCategoriesSpend(month);

    setBudgets(result);
    setLoading(false);
  }, [month]);

  useEffect(() => {
    load();
  }, [month, load]);

  return { budgets, loading, reload: load };
}
