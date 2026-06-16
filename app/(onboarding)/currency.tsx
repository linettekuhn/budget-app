import { useOnboarding } from "@/components/context/onboarding-provider";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AnimatedScreen from "@/components/ui/animated-screen";
import CapsuleButton from "@/components/ui/capsule-button";
import CapsuleDropdown from "@/components/ui/capsule-dropdown";
import OnboardingControls from "@/components/ui/onboarding-controls";
import { Colors, getTheme } from "@/constants/theme";
import { getSupportedCurrencies } from "@/utils/currency";
import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CurrencyOnboarding() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[getTheme(colorScheme)].secondary[500];
  const router = useRouter();

  const { state, setState } = useOnboarding();
  const [selectedCurrency, setSelectedCurrency] = useState(state.currency);

  const currencies = getSupportedCurrencies();
  const currencyOptions = currencies.map((c) => ({
    value: c.code,
    label: `${c.code} — ${c.name}`,
  }));

  const handleNext = () => {
    setState((prev) => ({ ...prev, currency: selectedCurrency }));
    router.push("/categories");
  };

  return (
    <AnimatedScreen entering="slideRight">
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: Colors[getTheme(colorScheme)].background },
        ]}
      >
        <OnboardingControls />
        <ScrollView contentContainerStyle={styles.container}>
          <ThemedView style={styles.main}>
            <ThemedText type="h1">Choose Your Currency</ThemedText>
            <ThemedText type="h4">
              All budgets and transactions will be displayed in this currency.
            </ThemedText>
            <CapsuleDropdown
              value={selectedCurrency}
              options={currencyOptions}
              onChange={setSelectedCurrency}
              textType="caption"
            />
            <CapsuleButton
              text="Next"
              iconName="arrow-right"
              IconComponent={Octicons}
              bgFocused={btnColor}
              onPress={handleNext}
            />
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreen>
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
    paddingHorizontal: 10,
    gap: 30,
    alignItems: "stretch",
  },
});
