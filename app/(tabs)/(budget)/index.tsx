import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CapsuleButton from "@/components/ui/capsule-button";
import { Colors } from "@/constants/theme";
import { useCategories } from "@/hooks/useCategories";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Budget() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary1;
  const router = useRouter();

  const { loading, categories, reload } = useCategories();

  useEffect(() => {
    reload();
  }, [reload]);

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
          <CapsuleButton
            text="MONTHLY TRANSACTIONS"
            onPress={() => router.push("/monthly-transactions")}
            bgFocused={btnColor}
          />
          {categories.map((category) => {
            return (
              <Pressable
                key={category.id}
                onPress={() =>
                  router.push({
                    pathname: "/category-transactions",
                    params: { category: JSON.stringify(category) },
                  })
                }
              >
                <ThemedText type="bodyLarge">
                  {category.name
                    .split(" ")
                    .map((word) => word[0].toUpperCase() + word.slice(1))
                    .join(" ")}
                </ThemedText>
                <ThemedText type="body">{category.budget}</ThemedText>
              </Pressable>
            );
          })}
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
    gap: 20,
  },
});
