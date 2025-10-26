import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CapsuleButton from "@/components/ui/capsule-button";
import { Colors } from "@/constants/theme";
import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SalaryOnboarding() {
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
          <ThemedText type="h1" style={{ textAlign: "center" }}>
            Add Your Monthly Income
          </ThemedText>
          <ThemedText type="h4">
            Entering your salary helps us calculate savings.
          </ThemedText>
          <ThemedText type="h3">
            You can skip this step if you&apos;d like and always add it later!
          </ThemedText>

          <ThemedView style={styles.horizontalContainer}>
            <CapsuleButton
              text="Next"
              iconName="arrow-right"
              IconComponent={Octicons}
              bgFocused={btnColor}
              onPress={() => router.push("/finish")}
            />
            <CapsuleButton
              text="Skip"
              bgFocused={btnColor}
              onPress={() => router.push("/finish")}
            />
          </ThemedView>
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
});
