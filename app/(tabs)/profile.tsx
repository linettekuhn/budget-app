import { ThemedView } from "@/components/themed-view";
import CapsuleButton from "@/components/ui/capsule-button";
import { Colors } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { Alert, ScrollView, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const colorScheme = useColorScheme();
  const db = useSQLiteContext();
  const bgColor = Colors[colorScheme ?? "light"].background;
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];

  // TODO: DEV ONLY delete later
  const resetDatabase = async () => {
    await db.runAsync("DELETE FROM transactions");
    Alert.alert("database cleared!");
  };

  const resetOnboarding = async () => {
    await AsyncStorage.setItem("completedOnboarding", "false");
    Alert.alert("onboarding reset!");
  };

  const resetApp = async () => {
    try {
      await AsyncStorage.clear();

      const db = await SQLite.openDatabaseAsync("app.db");
      await db.execAsync("DROP TABLE IF EXISTS transactions");
      await db.execAsync("DROP TABLE IF EXISTS categories");

      console.log("App data cleared successfully!");
    } catch (error) {
      console.error("Error clearing app data:", error);
    }
  };
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.main}>
          <CapsuleButton
            text="RESET DATABASE"
            onPress={resetDatabase}
            bgFocused={btnColor}
          />
          <CapsuleButton
            text="RESET ONBOARDING"
            onPress={resetOnboarding}
            bgFocused={btnColor}
          />
          <CapsuleButton
            text="RESET APP"
            onPress={resetApp}
            bgFocused={btnColor}
          />
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

  amountWrapper: {
    width: "100%",
    height: 100,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    position: "relative",
  },

  amountDisplay: {
    height: 80,
    justifyContent: "center",
    textAlign: "center",
  },

  amountInput: {
    textAlign: "center",
    padding: 0,
    margin: 0,
    zIndex: 1,
  },

  heading: {
    marginVertical: 10,
  },

  options: {
    flexDirection: "column",
    alignItems: "center",
  },

  horizontalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },
});
