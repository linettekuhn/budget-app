import { Colors } from "@/constants/theme";
import { auth } from "@/firebase/firebaseConfig";
import { useModal } from "@/hooks/useModal";
import { AccountService } from "@/services/AccountService";
import Octicons from "@expo/vector-icons/Octicons";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useState } from "react";
import { Pressable, useColorScheme } from "react-native";
import { Toast } from "toastify-react-native";
import { ThemedText } from "../themed-text";
import CapsuleInput from "../ui/capsule-input-box";
import SettingsModal from "../ui/modal/settings-modal";
import ProfileOption from "./profile-option";

function ChangePasswordContent({ onComplete }: { onComplete: () => void }) {
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? "light"].text;

  const [showOldPass, setShowOldPass] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const changePassword = async () => {
    if (!newPassword || !oldPassword) {
      Toast.show({
        type: "error",
        text1: "Password is required",
      });
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        Toast.show({
          type: "error",
          text1: "User not signed in",
        });
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, oldPassword);

      await reauthenticateWithCredential(user, credential);

      await AccountService.changeUserPassword(newPassword);

      onComplete();

      Toast.show({
        type: "success",
        text1: "Password changed successfully!",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error changing password",
      });
      console.error("Error changing password:", error);
    }
  };

  return (
    <SettingsModal
      title="Change Password"
      onCancel={onComplete}
      onComplete={changePassword}
    >
      <ThemedText type="bodyLarge">Enter your old password:</ThemedText>
      <CapsuleInput
        value={oldPassword}
        onChangeText={setOldPassword}
        placeholder="Password"
        keyboardType="default"
        secureTextEntry={!showOldPass}
        IconComponent={Octicons}
        iconName="lock"
      >
        <Pressable onPress={() => setShowOldPass((prev) => !prev)}>
          {showOldPass ? (
            <Octicons name="eye-closed" size={20} color={textColor} />
          ) : (
            <Octicons name="eye" size={20} color={textColor} />
          )}
        </Pressable>
      </CapsuleInput>
      <ThemedText type="bodyLarge">Enter your new password:</ThemedText>
      <CapsuleInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Password"
        keyboardType="default"
        secureTextEntry={!showNewPass}
        IconComponent={Octicons}
        iconName="lock"
      >
        <Pressable onPress={() => setShowNewPass((prev) => !prev)}>
          {showNewPass ? (
            <Octicons name="eye-closed" size={20} color={textColor} />
          ) : (
            <Octicons name="eye" size={20} color={textColor} />
          )}
        </Pressable>
      </CapsuleInput>
    </SettingsModal>
  );
}

export default function ChangePasswordOption() {
  const { openModal, closeModal } = useModal();

  const handleChangePassword = () => {
    openModal(<ChangePasswordContent onComplete={closeModal} />);
  };

  return (
    <ProfileOption text="Change password" onPress={handleChangePassword} />
  );
}
