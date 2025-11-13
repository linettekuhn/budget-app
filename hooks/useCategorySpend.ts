import { CategorySpend } from "@/types";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

export function useCategorySpend(categoryId: number, month?: string) {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<CategorySpend | null>(null);
  const monthFilter = month ? month : new Date().toISOString().slice(0, 7);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await db.getFirstAsync<CategorySpend>(
      `
        SELECT
            c.id,
            c.name,
            c.color,
            c.budget,
            c.type,
            IFNULL(SUM(
                CASE 
                    WHEN t.type = 'expense' THEN t.amount
                    WHEN t.type = 'income' THEN -t.amount
                    ELSE 0
                END
            ), 0) AS totalSpent
        FROM categories c
        LEFT JOIN transactions t 
            ON c.id = t.categoryId
            AND strftime('%Y-%m', t.date) = ?
        WHERE c.id = ?
        GROUP BY c.id
      `,
      [monthFilter, categoryId]
    );

    setBudget(result);
    setLoading(false);
  }, [db, monthFilter, categoryId]);

  useEffect(() => {
    load();
  }, [month, categoryId, load]);

  return { budget, loading, reload: load };
}
