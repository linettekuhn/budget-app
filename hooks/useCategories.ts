import { CategoryType } from "@/types";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export function useCategories() {
  const db = useSQLiteContext();

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await db.getAllAsync<CategoryType>(
          "SELECT * FROM categories"
        );

        const savedCategories = data.map((row) => ({
          id: row.id,
          name: row.name,
          color: row.color,
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
    };

    loadCategories();
  }, []);

  return { categories, loading, setCategories };
}
