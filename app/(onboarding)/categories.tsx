import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CapsuleButton from "@/components/ui/capsule-button";
import CapsuleToggle from "@/components/ui/capsule-toggle";
import CustomCategory from "@/components/ui/modal/category-modal";
import { Colors } from "@/constants/theme";
import { useCategories } from "@/hooks/useCategories";
import { useModal } from "@/hooks/useModal";
import { CategoryType } from "@/types";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoriesOnboarding() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>(
    []
  );
  const db = useSQLiteContext();

  const toggleCategory = (category: CategoryType) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.some((cat) => cat.id === category.id);

      if (isSelected) {
        // remove if selected
        return prev.filter((cat) => cat.id !== category.id);
      } else {
        // add if not selected
        return [...prev, category];
      }
    });
  };

  const saveSelectedCategories = async () => {
    if (!selectedCategories.length) {
      return;
    }

    // (?, ?) for each category
    const placeholders = selectedCategories.map(() => "(?, ?)").join(", ");

    // values to fill up parameter placeholders
    const values: string[] = [];
    selectedCategories.forEach((cat) => {
      values.push(cat.name, cat.color);
    });

    const query = `INSERT INTO categories (name, color) VALUES ${placeholders}`;

    try {
      await db.runAsync("DELETE FROM categories");
      await db.runAsync(query, values);
    } catch (error) {
      console.log(error);
    } finally {
      router.push("/budget");
    }
  };

  const { openModal, closeModal } = useModal();
  const { categories, loading, reload } = useCategories();

  useEffect(() => {
    reload();
  }, [reload]);

  const handleOpen = () => {
    openModal(
      <ThemedView style={styles.main}>
        <CustomCategory
          onComplete={() => {
            closeModal();
            reload();
          }}
        />
      </ThemedView>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.main}>
          <ThemedText type="h1" style={{ textAlign: "center" }}>
            Choose or Add Your Categories
          </ThemedText>
          <ThemedText type="h4">
            We&apos;ve added a few default categories to get you started.
          </ThemedText>
          <ThemedText type="h3">
            You can customize them or create your own!
          </ThemedText>

          <ThemedView style={styles.horizontalContainer}>
            {categories.map((category) => {
              const categoryColor = adjustColorForScheme(
                category.color,
                colorScheme
              );
              return (
                <CapsuleToggle
                  key={category.id}
                  text={category.name}
                  bgFocused={categoryColor}
                  selected={selectedCategories.some(
                    (cat) => cat.id === category.id
                  )}
                  onPress={() => toggleCategory(category)}
                />
              );
            })}
            <CapsuleButton
              onPress={handleOpen}
              text="CREATE CATEGORY"
              bgFocused={btnColor}
              IconComponent={Octicons}
              iconName="plus"
            />
          </ThemedView>

          <CapsuleButton
            text="Next"
            iconName="arrow-right"
            IconComponent={Octicons}
            bgFocused={btnColor}
            onPress={saveSelectedCategories}
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  main: {
    paddingVertical: 30,
    flex: 1,
    gap: 30,
    alignItems: "center",
  },

  horizontalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },
});
