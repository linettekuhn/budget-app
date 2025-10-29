import { CategoryType } from "@/types";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export function useCategories() {
  const db = useSQLiteContext();
  const [reloadFlag, setReloadFlag] = useState(false);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      const data = await db.getAllAsync<CategoryType>(
        "SELECT * FROM categories"
      );

      const savedCategories = data.map((row) => ({
        id: row.id,
        name: row.name,
        color: row.color,
        budget: row.budget,
      }));

      setCategories(savedCategories);
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
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadCategories();
  }, [reloadFlag, loadCategories]);

  const reload = useCallback(() => setReloadFlag((flag) => !flag), []);
  return { categories, loading, setCategories, reload };
}
