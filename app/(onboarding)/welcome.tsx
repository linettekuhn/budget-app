import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CapsuleButton from "@/components/ui/capsule-button";
import { Colors } from "@/constants/theme";
import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import { StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeOnboarding() {
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
      <ThemedView style={styles.container}>
        <ThemedView style={styles.main}>
          <ThemedText type="displayLarge">Welcome!</ThemedText>
          <ThemedText type="h4">
            Take control of your money, track your spending, and reach your
            financial goals
          </ThemedText>
          <ThemedText type="h3" style={{ textAlign: "center" }}>
            Let&apos;s set things up to get you started!
          </ThemedText>

          <CapsuleButton
            text="Get Started"
            iconName="arrow-right"
            IconComponent={Octicons}
            bgFocused={btnColor}
            onPress={() => router.push("/categories")}
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
