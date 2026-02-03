import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const BACKEND_URL = "http://api.piggy-stash.linettekuhn.com";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerPushToken(userId: string) {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (!Device.isDevice) {
    console.warn("Must use physical device for push notifications");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.warn(
      "Permission not granted to get push token for push notification!"
    );
    return;
  }
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;
  if (!projectId) {
    console.warn("Project ID not found");
  }
  try {
    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;

    const res = await fetch(`${BACKEND_URL}/register-push-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, token }),
    });

    const data = await res.json();

    if (!data.ok) {
      console.error("Failed to register push token", data);
    } else {
      console.log("Push token registered successfully");
    }
  } catch (error: unknown) {
    console.warn(`${error}`);
  }
}

export async function pingBackend(
  userId: string,
  spentPercent: number,
  weeklySpent: number,
  currentStreak: number
) {
  try {
    await fetch(`${BACKEND_URL}/ping`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        spentPercent,
        weeklySpent,
        currentStreak,
      }),
    });
  } catch (error) {
    console.error("Error pinging backend", error);
  }
}

export async function updateRemoteNotificationSettings(
  userId: string,
  settings: {
    daily: boolean;
    weekly: boolean;
    midMonth: boolean;
  }
) {
  try {
    await fetch(`${BACKEND_URL}/update-notification-settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        settings,
      }),
    });
  } catch (error) {
    console.error("Error updating notification settings", error);
  }
}
