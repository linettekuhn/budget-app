import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CapsuleButton from "@/components/ui/capsule-button";
import CapsuleToggle from "@/components/ui/capsule-toggle";
import { Colors } from "@/constants/theme";
import { useCategories } from "@/hooks/useCategories";
import { CategoryType } from "@/types";
import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoriesOnboarding() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary1;
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>(
    []
  );

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

  const { loading, categories } = useCategories();

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
            {categories.map((category) => (
              // TODO: add a category modal
              <CapsuleToggle
                key={category.id}
                text={category.name}
                bgFocused={category.color}
                selected={selectedCategories.some(
                  (cat) => cat.id === category.id
                )}
                onPress={() => toggleCategory(category)}
              />
            ))}
          </ThemedView>

          <CapsuleButton
            text="Next"
            iconName="arrow-right"
            IconComponent={Octicons}
            bgFocused={btnColor}
            // TODO: store in sql selected before moving on
            onPress={() => router.push("/budget")}
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
