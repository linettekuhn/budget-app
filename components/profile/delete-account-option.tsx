import { Colors } from "@/constants/theme";
import { auth } from "@/firebase/firebaseConfig";
import { useModal } from "@/hooks/useModal";
import { AccountService } from "@/services/AccountService";
import DatabaseService from "@/services/DatabaseService";
import Octicons from "@expo/vector-icons/Octicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useState } from "react";
import { Alert, Pressable, useColorScheme } from "react-native";
import { Toast } from "toastify-react-native";
import { ThemedText } from "../themed-text";
import CapsuleInput from "../ui/capsule-input-box";
import SettingsModal from "../ui/modal/settings-modal";
import ProfileOption from "./profile-option";

function DeleteAccountContent({ onComplete }: { onComplete: () => void }) {
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? "light"].text;

  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState("");

  const deleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure? This will delete your account and all app data associated with it. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel", onPress: onComplete },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!password) {
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

              const credential = EmailAuthProvider.credential(
                user.email,
                password
              );

              await reauthenticateWithCredential(user, credential);

              await AccountService.deleteUserAccount();

              await AsyncStorage.clear();

              await DatabaseService.resetTables();

              onComplete();

              router.replace("/(auth)/login");

              Toast.show({
                type: "success",
                text1: "Account deleted successfully!",
              });
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Error deleting account",
              });
              console.error("Error deleting account:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SettingsModal
      title="Confirm Deletion"
      onCancel={onComplete}
      onComplete={deleteAccount}
      proceedLabel="DELETE"
    >
      <ThemedText type="bodyLarge">Enter your password to proceed:</ThemedText>
      <CapsuleInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        keyboardType="default"
        secureTextEntry={!showPass}
        IconComponent={Octicons}
        iconName="lock"
      >
        <Pressable onPress={() => setShowPass((prev) => !prev)}>
          {showPass ? (
            <Octicons name="eye-closed" size={20} color={textColor} />
          ) : (
            <Octicons name="eye" size={20} color={textColor} />
          )}
        </Pressable>
      </CapsuleInput>
    </SettingsModal>
  );
}

export default function DeleteAccountOption() {
  const { openModal, closeModal } = useModal();

  const handleDeleteAccount = () => {
    openModal(<DeleteAccountContent onComplete={closeModal} />);
  };

  return <ProfileOption text="Delete account" onPress={handleDeleteAccount} />;
}
