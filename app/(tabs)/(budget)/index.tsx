import { ThemedView } from "@/components/themed-view";
import CapsuleButton from "@/components/ui/capsule-button";
import { Colors } from "@/constants/theme";
import { useCategories } from "@/hooks/useCategories";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Budget() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary1;
  const router = useRouter();

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
          <CapsuleButton
            text="MONTHLY TRANSACTIONS"
            onPress={() => router.push("/monthly-transactions")}
            bgFocused={btnColor}
          />
          {categories.map((category) => {
            return (
              <CapsuleButton
                key={category.id}
                text={category.name
                  .split(" ")
                  .map((word) => word[0].toUpperCase() + word.slice(1))
                  .join(" ")}
                onPress={() =>
                  router.push({
                    pathname: "/category-transactions",
                    params: { category: JSON.stringify(category) },
                  })
                }
                bgFocused={category.color}
              />
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
