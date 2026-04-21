import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { NotificationSettings } from "@/services/DatabaseService";
import { updateRemoteNotificationSettings } from "@/services/NotificationService";
import { useState } from "react";
import { Switch, View } from "react-native";
import { Toast } from "toastify-react-native";
import { ThemedText } from "../themed-text";
import SettingsModal from "../ui/modal/settings-modal";
import ProfileOption from "./profile-option";

function PushNotificationSettingsContent({
  initialSettings,
  onSave,
  onCancel,
}: {
  initialSettings: NotificationSettings;
  onSave: (settings: NotificationSettings) => Promise<void>;
  onCancel: () => void;
}) {
  const [daily, setDaily] = useState(initialSettings.daily);
  const [weekly, setWeekly] = useState(initialSettings.weekly);
  const [midMonth, setMidMonth] = useState(initialSettings.midMonth);

  return (
    <SettingsModal
      onCancel={onCancel}
      title="Edit your push notification settings"
      onComplete={async () => {
        try {
          await onSave({ daily, weekly, midMonth });
        } catch (error: unknown) {
          if (error instanceof Error) {
            Toast.show({
              type: "error",
              text1: error.message,
            });
          } else {
            Toast.show({
              type: "error",
              text1: "An error occurred while updating settings",
            });
          }
        }
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <ThemedText type="h4">Daily streak reminders</ThemedText>
        <Switch value={daily} onValueChange={setDaily} />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <ThemedText type="h4">Weekly summary</ThemedText>
        <Switch value={weekly} onValueChange={setWeekly} />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <ThemedText type="h4">Mid-month budget check-in</ThemedText>
        <Switch value={midMonth} onValueChange={setMidMonth} />
      </View>
    </SettingsModal>
  );
}

export default function EditNotificationSettingsOption() {
  const { openModal, closeModal } = useModal();
  const { settings, updateSettings: updateLocalNotificationSettings } =
    useNotificationSettings();

  const { user } = useAuth();
  if (!user) {
    return null;
  }

  const handleNameChange = () => {
    openModal(
      <PushNotificationSettingsContent
        initialSettings={settings}
        onSave={async (newSettings) => {
          await updateLocalNotificationSettings(newSettings);

          await updateRemoteNotificationSettings(user?.uid, newSettings);

          closeModal();
        }}
        onCancel={closeModal}
      />
    );
  };

  return <ProfileOption text="Push notifications" onPress={handleNameChange} />;
}
