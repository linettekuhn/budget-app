import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/hooks/useAuth";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    "BricolageGrotesque-ExtraBold": require("../assets/fonts/BricolageGrotesque-ExtraBold.ttf"),
    "BricolageGrotesque-Bold": require("../assets/fonts/BricolageGrotesque-Bold.ttf"),
    "BricolageGrotesque-SemiBold": require("../assets/fonts/BricolageGrotesque-SemiBold.ttf"),
    "BricolageGrotesque-Medium": require("../assets/fonts/BricolageGrotesque-Medium.ttf"),
    "BricolageGrotesque-Regular": require("../assets/fonts/BricolageGrotesque-Regular.ttf"),
    "BricolageGrotesque-Light": require("../assets/fonts/BricolageGrotesque-Light.ttf"),
    "BricolageGrotesque-ExtraLight": require("../assets/fonts/BricolageGrotesque-ExtraLight.ttf"),
  });

  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loaded || loading) return;

    if (user) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/login");
    }
  }, [loaded, loading, user]);

  if (!loaded || loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
