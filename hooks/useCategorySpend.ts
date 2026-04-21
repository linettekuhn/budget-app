import DatabaseService from "@/services/DatabaseService";
import { CategorySpend } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useCategorySpend(categoryId: string, selectedDate: string) {
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<CategorySpend | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [year, month] = selectedDate.split("T")[0].split("-").map(Number);

    const result = await DatabaseService.getCategorySpend(
      categoryId,
      year,
      month
    );

    setBudget(result);
    setLoading(false);
  }, [selectedDate, categoryId]);

  useEffect(() => {
    load();
  }, [categoryId]);

  return { budget, loading, reload: load };
}
