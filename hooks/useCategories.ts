import DatabaseService from "@/services/DatabaseService";
import { CategoryType } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export function useCategories() {
  const [reloadFlag, setReloadFlag] = useState(false);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      const data = await DatabaseService.getCategories();

      const savedCategories = data.map((row) => ({
        id: row.id,
        name: row.name,
        color: row.color,
        type: row.type,
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
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadCategories();
  }, [reloadFlag, loadCategories]);

  const reload = useCallback(() => setReloadFlag((flag) => !flag), []);
  return { categories, loading, setCategories, reload };
}
