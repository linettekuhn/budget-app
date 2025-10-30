import { CategorySpend } from "@/types";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

export function useCategoriesSpend(month?: string) {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<CategorySpend[]>([]);
  const monthFilter = month ? month : new Date().toISOString().slice(0, 7);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await db.getAllAsync<CategorySpend>(
      `
        SELECT
            c.id,
            c.name,
            c.color,
            c.budget,
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
        GROUP BY c.id
      `,
      [monthFilter]
    );

    setBudgets(result);
    setLoading(false);
  }, [db, monthFilter]);

  useEffect(() => {
    load();
  }, [month, load]);

  return { budgets, loading, reload: load };
}
