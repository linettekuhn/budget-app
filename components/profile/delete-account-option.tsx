import { Colors } from "@/constants/theme";
import { auth } from "@/firebase/firebaseConfig";
import { useModal } from "@/hooks/useModal";
import { AccountService } from "@/services/AccountService";
import DatabaseService from "@/services/DatabaseService";
import Octicons from "@expo/vector-icons/Octicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
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
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  const deleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      user
        ? "Are you sure? This will delete your account and all app data associated with it. This action cannot be undone."
        : "Are you sure? This will delete all local app data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel", onPress: onComplete },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (user && !password) {
              Toast.show({
                type: "error",
                text1: "Password is required",
              });
              return;
            }

            try {
              setLoading(true);
              if (user && user.email) {
                const credential = EmailAuthProvider.credential(
                  user.email,
                  password
                );

                await reauthenticateWithCredential(user, credential);

                await AccountService.deleteUserAccount();
              }

              await AsyncStorage.clear();

              await DatabaseService.resetTables();

              setLoading(false);

              await Updates.reloadAsync();
            } catch (error) {
              setLoading(false);
              Toast.show({
                type: "error",
                text1: user
                  ? "Error deleting account"
                  : "Error clearing local data",
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
      <ThemedText type="bodyLarge" style={{ alignSelf: "center" }}>
        {user ? "Enter your password to proceed:" : "Delete all local data?"}
      </ThemedText>
      {user && (
        <CapsuleInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          keyboardType="default"
          secureTextEntry={!showPass}
          IconComponent={Octicons}
          iconName="lock"
        >
          <Pressable
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => setShowPass((prev) => !prev)}
          >
            {showPass ? (
              <Octicons name="eye-closed" size={20} color={textColor} />
            ) : (
              <Octicons name="eye" size={20} color={textColor} />
            )}
          </Pressable>
        </CapsuleInput>
      )}
      {loading && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 999,
          }}
        >
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme ?? "light"].text}
          />
        </View>
      )}
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
