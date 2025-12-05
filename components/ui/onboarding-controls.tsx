import { useOnboarding } from "@/components/context/onboarding-provider";
import { ThemedView } from "@/components/themed-view";
import TextButton from "@/components/ui/text-button";
import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";

export default function OnboardingControls() {
  const router = useRouter();

  const { resetOnboarding } = useOnboarding();

  return (
    <ThemedView style={styles.controls}>
      <TextButton
        text="Back"
        iconName="arrow-left"
        IconComponent={Octicons}
        onPress={() => router.back()}
      />
      <TextButton
        text="Restart"
        iconName="sync"
        IconComponent={Octicons}
        onPress={() => resetOnboarding()}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    width: "100%",
    zIndex: 1,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    top: 0,
  },
});
