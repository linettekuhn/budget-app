import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CapsuleButton from "@/components/ui/capsule-button";
import CapsuleInput from "@/components/ui/capsule-input-box";
import { Colors } from "@/constants/theme";
import { firebaseErrorMessages } from "@/firebase/errorMessages";
import { auth } from "@/firebase/firebaseConfig";
import SyncService from "@/services/SyncService";
import Octicons from "@expo/vector-icons/Octicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  useColorScheme,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function Login() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const textColor = Colors[colorScheme ?? "light"].text;
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await SyncService.sync();

      Toast.show({
        type: "success",
        text1: "Account logged in!",
      });
      router.replace("/(tabs)");
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        Toast.show({
          type: "error",
          text1: firebaseErrorMessages[error.code] ?? "Something went wrong",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error ocurred logging in",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOffline = async () => {
    try {
      await AsyncStorage.setItem("offlineMode", "true");

      // check if user has completed onboarding
      const hasCompleted = await AsyncStorage.getItem("completedOnboarding");
      console.log("Onboarding complete:", hasCompleted);

      // in offline mode check if onboarding has been completed
      if (hasCompleted !== "true") {
        if (hasCompleted === null) {
          await AsyncStorage.setItem("completedOnboarding", "false");
        }
        router.replace("/(onboarding)/welcome");
        return;
      }

      // if onboarding complete and offline, access app
      router.replace("/(tabs)");
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={Platform.OS === "ios" ? 80 : 100}
          enableOnAndroid={true}
          contentContainerStyle={styles.container}
        >
          <ThemedView style={styles.main}>
            <ThemedView style={styles.form}>
              <ThemedView style={styles.header}>
                <ThemedText type="displayMedium">Login</ThemedText>
                <ThemedText type="h2">Please sign in to continue</ThemedText>
              </ThemedView>
              <CapsuleInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                inputMode="email"
                IconComponent={Octicons}
                iconName="mail"
              />
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
              <CapsuleButton
                text="SIGN IN"
                onPress={handleLogin}
                bgFocused={btnColor}
                disabled={loading}
              />
              <ThemedView style={styles.registerPrompt}>
                <ThemedText type="body">Don&apos;t have an account?</ThemedText>
                <Pressable onPress={() => router.push("/register")}>
                  <ThemedText type="link">Sign up</ThemedText>
                </Pressable>
              </ThemedView>
              <Pressable onPress={handleOffline}>
                <ThemedText type="link">Continue Offline</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
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
    gap: 40,
  },

  form: {
    flex: 1,
    gap: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    alignItems: "center",
    marginVertical: 20,
  },

  registerPrompt: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 30,
    justifyContent: "space-between",
    alignItems: "center",
  },
});
