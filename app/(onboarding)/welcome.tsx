import { useOnboarding } from "@/components/context/onboarding-provider";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CapsuleButton from "@/components/ui/capsule-button";
import { Colors } from "@/constants/theme";
import DatabaseService from "@/services/DatabaseService";
import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import { StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function WelcomeOnboarding() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];
  const router = useRouter();

  const { reset } = useOnboarding();
  const startOnboardingProcess = async () => {
    try {
      await DatabaseService.clearCategories();
      await DatabaseService.seedDefaultCategories();
      reset();
      router.push("/categories");
    } catch (error: unknown) {
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error ocurred while starting onboarding",
        });
      }
    }
  };
  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.main}>
          <ThemedText type="displayLarge">Welcome!</ThemedText>
          <ThemedText type="h4">
            Take control of your money, track your spending, and reach your
            financial goals
          </ThemedText>
          <ThemedText type="h3">
            Let&apos;s set things up to get you started!
          </ThemedText>

          <CapsuleButton
            text="Get Started"
            iconName="arrow-right"
            IconComponent={Octicons}
            bgFocused={btnColor}
            onPress={startOnboardingProcess}
          />
        </ThemedView>
      </ThemedView>
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
    flex: 1,
    justifyContent: "center",
  },

  main: {
    paddingVertical: 30,
    paddingHorizontal: 10,
    gap: 30,
    alignItems: "center",
  },
});
