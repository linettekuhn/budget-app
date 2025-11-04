import { ModalProvider } from "@/components/ui/modal/modal-provider";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "react-native-reanimated";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useMemo(
    () => (colorScheme === "dark" ? DarkTheme : DefaultTheme),
    [colorScheme]
  );
  const [fontsLoaded] = useFonts({
    "BricolageGrotesque-ExtraBold": require("../assets/fonts/BricolageGrotesque-ExtraBold.ttf"),
    "BricolageGrotesque-Bold": require("../assets/fonts/BricolageGrotesque-Bold.ttf"),
    "BricolageGrotesque-SemiBold": require("../assets/fonts/BricolageGrotesque-SemiBold.ttf"),
    "BricolageGrotesque-Medium": require("../assets/fonts/BricolageGrotesque-Medium.ttf"),
    "BricolageGrotesque-Regular": require("../assets/fonts/BricolageGrotesque-Regular.ttf"),
    "BricolageGrotesque-Light": require("../assets/fonts/BricolageGrotesque-Light.ttf"),
    "BricolageGrotesque-ExtraLight": require("../assets/fonts/BricolageGrotesque-ExtraLight.ttf"),
  });

  const { user, loading: authLoading } = useAuth();
  const [dbReady, setDbReady] = useState<boolean>(false);
  const initialCheckDone = useRef(false);

  const createDatabase = useCallback(async (db: SQLiteDatabase) => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          color TEXT NOT NULL,
          budget DECIMAL(13, 2)
        );
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          amount DECIMAL(13, 2) NOT NULL,
          type TEXT NOT NULL,
          date TEXT DEFAULT (datetime('now')),
          categoryId INTEGER,
          FOREIGN KEY (categoryId) REFERENCES categories(id)
          );
        CREATE TABLE IF NOT EXISTS salary (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          amount DECIMAL(13, 2) NOT NULL,
          monthly DECIMAL(13, 2) NOT NULL,
          hoursPerWeek DECIMAL(5, 2)
          )
          `);

      type CountResult = { count: number };
      const existingCategories = await db.getAllAsync<CountResult>(
        "SELECT COUNT(*) as count FROM categories"
      );
      // TODO: dark and light mode category colors
      if (existingCategories[0].count === 0) {
        await db.execAsync(`
          INSERT INTO categories (name, color) VALUES
            ('Food', '#FF6B6B'),
            ('Transport', '#4ECDC4'),
            ('Entertainment', '#FFD93D'),
            ('Bills', '#6A4C93');
        `);
      }
      setDbReady(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("error creating database");
      }
    }
  }, []);

  useEffect(() => {
    if (!fontsLoaded || !dbReady || authLoading || initialCheckDone.current)
      return;

    const routeUser = async () => {
      try {
        initialCheckDone.current = true;

        // check if user has completed onboarding
        const hasCompleted = await AsyncStorage.getItem("completedOnboarding");
        console.log("Onboarding complete:", hasCompleted);
        if (hasCompleted !== "true") {
          if (hasCompleted === null) {
            await AsyncStorage.setItem("completedOnboarding", "false");
          }
          console.log("Navigating to onboarding");
          router.replace("/(onboarding)/welcome");
          console.log("Navigated to onboarding");
          return;
        }

        // after onboarding is complete check if user is logged in
        if (user) {
          router.replace("/(tabs)");
          return;
        }

        // if user is not logged in check for offline mode
        const offlineMode = await AsyncStorage.getItem("offlineMode");
        console.log("Offline mode:", offlineMode);
        if (offlineMode === null) {
          await AsyncStorage.setItem("offlineMode", "false");
        }
        if (offlineMode === "true") {
          router.replace("/(tabs)");
          return;
        }

        // not logged in, not offline mode: try to authenticate user
        router.replace("/(auth)/login");
      } catch (error) {
        console.log(error);
      }
    };

    routeUser();
  }, [fontsLoaded, authLoading, user, dbReady]);

  return (
    <SQLiteProvider databaseName="app.db" onInit={createDatabase}>
      <ThemeProvider value={theme}>
        <ModalProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
          </Stack>
          <StatusBar style="auto" />
        </ModalProvider>
      </ThemeProvider>
    </SQLiteProvider>
  );
}
