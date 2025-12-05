import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import Avatar from "@/components/ui/avatar";
import CapsuleButton from "@/components/ui/capsule-button";
import { Colors } from "@/constants/theme";
import { useName } from "@/hooks/useName";
import DatabaseService from "@/services/DatabaseService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function Profile() {
  const colorScheme = useColorScheme();
  const { name, loading } = useName();
  const bgColor = Colors[colorScheme ?? "light"].background;
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];

  // TODO: DEV ONLY delete later
  const resetDatabase = async () => {
    await DatabaseService.clearTransactions();
    Toast.show({
      type: "success",
      text1: "Database cleared!",
    });
  };

  const resetOnboarding = async () => {
    await AsyncStorage.setItem("completedOnboarding", "false");
    Toast.show({
      type: "success",
      text1: "Onboarding reset!",
    });
  };

  const resetApp = async () => {
    try {
      await AsyncStorage.clear();

      await DatabaseService.resetTables();

      Toast.show({
        type: "success",
        text1: "App data cleared successfully!",
      });
    } catch (error) {
      Toast.show({
        type: "success",
        text1: "Error clearing app data",
      });
      console.error("Error clearing app data:", error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  // TODO: fix email
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.main}>
          <View
            style={[
              styles.profileWrapper,
              { backgroundColor: Colors[colorScheme ?? "light"].primary[200] },
            ]}
          >
            <Avatar name={name ?? ""} size={80} />
            <View style={styles.profile}>
              <ThemedText type="h1">{name}</ThemedText>
              <ThemedText type="bodySmall">linette.kuhn@gmail.com</ThemedText>
            </View>
          </View>
          <CapsuleButton
            text="RESET TRANSACTIONS"
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

  profileWrapper: {
    flexDirection: "row",
    padding: 16,
    gap: 20,
    borderRadius: 20,
  },

  profile: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
});
