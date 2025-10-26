import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CapsuleButton from "@/components/ui/capsule-button";
import { Colors } from "@/constants/theme";
import Octicons from "@expo/vector-icons/Octicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FinishOnboarding() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary1;
  const router = useRouter();

  const handleCompleteOnboarding = async () => {
    await AsyncStorage.setItem("completedOnboarding", "true");
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.main}>
          <ThemedText type="displayMedium">You&apos;re All Set!</ThemedText>
          <ThemedText type="h4">
            Your budgets and categories are ready
          </ThemedText>
          <ThemedText type="h3">
            You can now start tracking your spending and building better money
            habits!
          </ThemedText>

          <CapsuleButton
            text="See Dashboard"
            iconName="arrow-right"
            IconComponent={Octicons}
            bgFocused={btnColor}
            onPress={handleCompleteOnboarding}
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

  horizontalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },

  categoryBudget: {
    flexDirection: "row",
  },
});
