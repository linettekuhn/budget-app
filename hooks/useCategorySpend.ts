import DatabaseService from "@/services/DatabaseService";
import { CategorySpend } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useCategorySpend(categoryId: string, month?: string) {
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<CategorySpend | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await DatabaseService.getCategorySpend(categoryId, month);

    setBudget(result);
    setLoading(false);
  }, [month, categoryId]);

  useEffect(() => {
    load();
  }, [month, categoryId, load]);

  return { budget, loading, reload: load };
}
