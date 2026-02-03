import DatabaseService, {
  NotificationSettings,
} from "@/services/DatabaseService";
import { useCallback, useEffect, useState } from "react";
import { Toast } from "toastify-react-native";

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    daily: true,
    weekly: true,
    midMonth: true,
  });
  const [loading, setLoading] = useState(true);
  const [reloadFlag, setReloadFlag] = useState(false);

  const loadNotificationSettings = useCallback(async () => {
    try {
      const saved = await DatabaseService.getNotificationSettings();
      setSettings(saved);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error occurred loading notification settings",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(() => setReloadFlag((flag) => !flag), []);

  const updateSettings = useCallback(
    async (newSettings: NotificationSettings) => {
      try {
        await DatabaseService.updateNotificationSettings(newSettings);
        reload();
        Toast.show({
          type: "success",
          text1: "Notification settings updated!",
        });
      } catch (error: unknown) {
        Toast.show({
          type: "error",
          text1:
            error instanceof Error
              ? error.message
              : "An error occurred updating notification settings",
        });
      }
    },
    [reload]
  );

  useEffect(() => {
    loadNotificationSettings();
  }, [loadNotificationSettings]);

  useEffect(() => {
    loadNotificationSettings();
  }, [reloadFlag]);

  return {
    settings,
    loading,
    reload,
    setSettings,
    updateSettings,
  };
}
