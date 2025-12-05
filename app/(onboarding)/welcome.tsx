import { useOnboarding } from "@/components/context/onboarding-provider";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CapsuleButton from "@/components/ui/capsule-button";
import CapsuleInput from "@/components/ui/capsule-input-box";
import { Colors } from "@/constants/theme";
import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import {
  Keyboard,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  useColorScheme,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function WelcomeOnboarding() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];
  const router = useRouter();

  const { state, setState } = useOnboarding();

  const startOnboardingProcess = async () => {
    try {
      if (!state.name) throw new Error("Please enter a name");
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={Platform.OS === "ios" ? 80 : 100}
          enableOnAndroid={true}
          contentContainerStyle={styles.container}
        >
          <ThemedView style={styles.main}>
            <ThemedText type="displayMedium">
              Welcome{state.name ? ` ${state.name}` : ""}!
            </ThemedText>
            <ThemedText type="h4">
              Take control of your money, track your spending, and reach your
              financial goals
            </ThemedText>
            <ThemedText type="h4">
              Let&apos;s set things up to get you started!
            </ThemedText>

            <ThemedText type="h3">First, what should we call you?</ThemedText>
            <CapsuleInput
              value={state.name}
              onChangeText={(text) =>
                setState((prev) => ({
                  ...prev,
                  name:
                    text.trim().charAt(0).toUpperCase() + text.trim().slice(1),
                }))
              }
              placeholder="Enter name here"
            />
            <CapsuleButton
              text="Get Started"
              iconName="arrow-right"
              IconComponent={Octicons}
              bgFocused={btnColor}
              onPress={startOnboardingProcess}
            />
          </ThemedView>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
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
