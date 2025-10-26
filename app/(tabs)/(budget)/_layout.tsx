import { Stack } from "expo-router";

export default function BudgetStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="monthly-transactions"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="category-transactions"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
