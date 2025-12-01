import { ModalProvider } from "@/components/ui/modal/modal-provider";
import {
  BadgeToast,
  ErrorToast,
  SuccessToast,
} from "@/components/ui/toast-components";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/hooks/useAuth";
import { useBadgeCheck } from "@/hooks/useBadgeCheck";
import DatabaseService from "@/services/DatabaseService";
import StreakService from "@/services/StreakService";
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
import ToastManager from "toastify-react-native";
import {
  ToastConfig,
  ToastConfigParams,
} from "toastify-react-native/utils/interfaces";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useMemo(
    () => (colorScheme === "dark" ? DarkTheme : DefaultTheme),
    [colorScheme]
  );
  const [fontsLoaded] = useFonts({
    "Onest-ExtraBold": require("../assets/fonts/Onest-ExtraBold.ttf"),
    "Onest-Bold": require("../assets/fonts/Onest-Bold.ttf"),
    "Onest-SemiBold": require("../assets/fonts/Onest-SemiBold.ttf"),
    "Onest-Medium": require("../assets/fonts/Onest-Medium.ttf"),
    "Onest-Regular": require("../assets/fonts/Onest-Regular.ttf"),
    "Onest-Light": require("../assets/fonts/Onest-Light.ttf"),
    "Onest-ExtraLight": require("../assets/fonts/Onest-ExtraLight.ttf"),
  });

  const { user, loading: authLoading } = useAuth();
  const { checkBadges } = useBadgeCheck();
  const [dbReady, setDbReady] = useState<boolean>(false);
  const initialCheckDone = useRef(false);

  const createDatabase = useCallback(async (db: SQLiteDatabase) => {
    try {
      await DatabaseService.initalize();
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

        // check if any badges were awarded while app was closed
        await checkBadges();

        // add any recurring transactions that happened while app was closed
        await DatabaseService.addMissedRecurringTransactions();

        // check and update streak
        await StreakService.updateStreak();

        // check if user has completed onboarding
        const hasCompleted = await AsyncStorage.getItem("completedOnboarding");
        console.log("Onboarding complete:", hasCompleted);
        if (hasCompleted !== "true") {
          if (hasCompleted === null) {
            await AsyncStorage.setItem("completedOnboarding", "false");
          }
          router.replace("/(onboarding)/welcome");
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
  }, [fontsLoaded, authLoading, user, dbReady, checkBadges]);

  const toastConfig: ToastConfig = {
    badge: (props: ToastConfigParams) => <BadgeToast {...props} />,
    success: (props: ToastConfigParams) => <SuccessToast {...props} />,
    error: (props: ToastConfigParams) => <ErrorToast {...props} />,
  };

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
          <ToastManager config={toastConfig} useModal={false} />
        </ModalProvider>
      </ThemeProvider>
    </SQLiteProvider>
  );
}
