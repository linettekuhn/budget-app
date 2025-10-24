import { ThemedView } from "@/components/themed-view";
import CapsuleButton from "@/components/ui/capsule-button";
import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Budget() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary1;
  const router = useRouter();

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
