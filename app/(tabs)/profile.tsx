import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import Avatar from "@/components/ui/avatar";
import ProfileButton from "@/components/ui/profile-button";
import { Colors } from "@/constants/theme";
import { useName } from "@/hooks/useName";
import DatabaseService from "@/services/DatabaseService";
import Octicons from "@expo/vector-icons/Octicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
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
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const loadStartDate = async () => {
      try {
        const date = await DatabaseService.getAppStartDate();
        setStartDate(date);
      } catch (error: unknown) {
        if (error instanceof Error) {
          Toast.show({
            type: "error",
            text1: error.message,
          });
        } else {
          Toast.show({
            type: "error",
            text1: "An error ocurred getting start date",
          });
        }
      }
    };

    loadStartDate();
  }, []);

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

  if (loading || !startDate) {
    return <ActivityIndicator size="large" />;
  }

  // TODO: fix email
  // TODO: add button functionality
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.main}>
          <View
            style={[
              styles.settingsWrapper,
              { backgroundColor: Colors[colorScheme ?? "light"].primary[300] },
            ]}
          >
            <View
              style={[
                styles.profileWrapper,
                {
                  backgroundColor: Colors[colorScheme ?? "light"].primary[200],
                },
              ]}
            >
              <Avatar name={name ?? ""} size={80} />
              <View style={styles.profile}>
                <ThemedText type="h1">{name}</ThemedText>
                <ThemedText type="bodySmall">linette.kuhn@gmail.com</ThemedText>
              </View>
            </View>
            <View style={{ paddingHorizontal: 24, gap: 32 }}>
              <ProfileButton
                text="Account"
                onPress={() => {}}
                IconComponent={Octicons}
                iconName="person"
              />
              <ProfileButton
                text="Notifications"
                onPress={() => {}}
                IconComponent={Octicons}
                iconName="bell"
              />
              <ProfileButton
                text="Settings"
                onPress={() => {}}
                IconComponent={Octicons}
                iconName="gear"
              />
              <ProfileButton
                text="Region"
                onPress={() => {}}
                IconComponent={Octicons}
                iconName="globe"
              />
              <ProfileButton
                text="Logout"
                onPress={() => {}}
                IconComponent={Octicons}
                iconName="sign-out"
              />
            </View>
          </View>
          <ThemedText
            type="bodyLarge"
            darkColor={Colors["dark"].primary[700]}
            lightColor={Colors["light"].primary[700]}
            style={{ textAlign: "center" }}
          >
            Budgeting since{" "}
            {startDate.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "2-digit",
            })}
          </ThemedText>
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

  settingsWrapper: {
    paddingBottom: 32,
    gap: 32,
    borderRadius: 20,
  },
});
