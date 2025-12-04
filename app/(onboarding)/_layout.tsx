import { OnboardingProvider } from "@/components/context/onboarding-provider";
import { Stack } from "expo-router";

export default function OnboardingStackLayout() {
  return (
    <OnboardingProvider>
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="categories" options={{ headerShown: false }} />
        <Stack.Screen name="budget" options={{ headerShown: false }} />
        <Stack.Screen name="salary" options={{ headerShown: false }} />
        <Stack.Screen name="finish" options={{ headerShown: false }} />
      </Stack>
    </OnboardingProvider>
  );
}
