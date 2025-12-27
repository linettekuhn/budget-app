import ChangeNameOption from "@/components/profile/change-name-option";
import ChangePasswordOption from "@/components/profile/change-password-option";
import DeleteAccountOption from "@/components/profile/delete-account-option";
import EditSalaryOption from "@/components/profile/edit-salary-option";
import ProfileOption from "@/components/profile/profile-option";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import Avatar from "@/components/ui/avatar";
import CapsuleButton from "@/components/ui/capsule-button";
import { Collapsible } from "@/components/ui/collapsible";
import { Colors } from "@/constants/theme";
import { auth } from "@/firebase/firebaseConfig";
import { useName } from "@/hooks/useName";
import DatabaseService from "@/services/DatabaseService";
import SyncService from "@/services/SyncService";
import Octicons from "@expo/vector-icons/Octicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function Profile() {
  const colorScheme = useColorScheme();
  const bgColor = Colors[colorScheme ?? "light"].background;
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];
  const color = Colors[colorScheme ?? "light"].text;
  const user = auth.currentUser;
  const email = user?.email ?? null;

  const { name, loading, reload } = useName();
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

  const syncApp = async () => {
    try {
      await SyncService.sync();

      Toast.show({
        type: "success",
        text1: "App synced successfully!",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error syncing app",
      });
      console.error("Error syncing app data:", error);
    }
  };

  const logout = async () => {
    try {
      // sign out from firebase
      await signOut(auth);

      // clear offline mode
      await AsyncStorage.removeItem("offlineMode");

      // navigate to login
      router.replace("/(auth)/login");

      Toast.show({
        type: "success",
        text1: "Logged out successfully!",
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Failed to log out",
      });
    }
  };

  const resetApp = async () => {
    Alert.alert(
      "Reset App Data",
      "Are you sure you want to reset the app? All local data will be deleted. Cloud data linked to your account won't be affected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();

              await DatabaseService.resetTables();

              await signOut(auth);

              router.replace("/(auth)/login");

              Toast.show({
                type: "success",
                text1: "App data cleared successfully!",
              });
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Error clearing app data",
              });
              console.error("Error clearing app data:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading || !startDate) {
    return <ActivityIndicator size="large" />;
  }

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
                {email ? (
                  <ThemedText type="bodySmall">{email}</ThemedText>
                ) : null}
              </View>
            </View>
            <View style={{ paddingHorizontal: 24, gap: 32 }}>
              <Collapsible
                title="Account"
                IconComponent={Octicons}
                iconName="person"
              >
                <View>
                  <ChangeNameOption onChange={reload} />
                  {user ? (
                    <>
                      <ChangePasswordOption />
                      <DeleteAccountOption />
                    </>
                  ) : (
                    <>
                      <ProfileOption
                        text="Log in"
                        onPress={() => {
                          router.replace("/(auth)/login");
                        }}
                      />
                      <ProfileOption
                        text="Create account"
                        onPress={() => {
                          router.replace("/(auth)/register");
                        }}
                      />
                    </>
                  )}
                </View>
              </Collapsible>
              <Collapsible
                title="Notifications"
                IconComponent={Octicons}
                iconName="bell"
              >
                <View>
                  <ProfileOption text="Push notifications" onPress={() => {}} />
                  <ProfileOption
                    text="In-app notifications"
                    onPress={() => {}}
                  />
                </View>
              </Collapsible>
              <Collapsible
                title="Settings"
                IconComponent={Octicons}
                iconName="gear"
              >
                <View>
                  <EditSalaryOption />
                  <ProfileOption
                    text="Manage recurring transactions"
                    onPress={() => {
                      router.push(
                        "/(tabs)/(profile)/manage-recurring-transactions"
                      );
                    }}
                  />
                  <ProfileOption text="Reset app" onPress={resetApp} />
                </View>
              </Collapsible>
              <Collapsible
                title="Region"
                IconComponent={Octicons}
                iconName="globe"
              >
                <View>
                  <ProfileOption text="Choose currency" onPress={() => {}} />
                </View>
              </Collapsible>
              {user && (
                <TouchableOpacity
                  onPress={logout}
                  activeOpacity={0.8}
                  style={[
                    styles.wrapper,
                    {
                      backgroundColor:
                        Colors[colorScheme ?? "light"].primary[200],
                    },
                  ]}
                >
                  <View style={styles.row}>
                    <Octicons name="sign-out" size={17} color={color} />

                    <ThemedText type="bodyLarge" style={{ color }}>
                      Logout
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              )}
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
          <CapsuleButton
            text="SYNC APP"
            onPress={syncApp}
            bgFocused={btnColor}
          />
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

  settingsWrapper: {
    paddingBottom: 32,
    gap: 32,
    borderRadius: 20,
  },

  wrapper: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
});
