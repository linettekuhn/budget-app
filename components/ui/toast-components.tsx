import { Colors } from "@/constants/theme";
import { StyleSheet, useColorScheme, View } from "react-native";
import { ToastConfigParams } from "toastify-react-native/utils/interfaces";
import { ThemedText } from "../themed-text";

export const BadgeToast = ({ text1, hide }: ToastConfigParams) => {
  const colorScheme = useColorScheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].primary[700] },
      ]}
    >
      <ThemedText type="bodyLarge">🏆</ThemedText>
      <ThemedText
        type="bodyLarge"
        darkColor={Colors["dark"].background}
        lightColor={Colors["light"].background}
      >
        {text1}
      </ThemedText>
      <ThemedText type="bodyLarge" onPress={hide}>
        ✖
      </ThemedText>
    </View>
  );
};

export const SuccessToast = ({ text1, hide }: ToastConfigParams) => {
  const colorScheme = useColorScheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].primary[700] },
      ]}
    >
      <ThemedText type="bodyLarge">✅</ThemedText>
      <ThemedText
        type="bodyLarge"
        darkColor={Colors["dark"].background}
        lightColor={Colors["light"].background}
      >
        {text1}
      </ThemedText>
      <ThemedText type="bodyLarge" onPress={hide}>
        ✖
      </ThemedText>
    </View>
  );
};

export const ErrorToast = ({ text1, hide }: ToastConfigParams) => {
  const colorScheme = useColorScheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].primary[700] },
      ]}
    >
      <ThemedText type="bodyLarge">⚠️</ThemedText>
      <ThemedText
        type="bodyLarge"
        darkColor={Colors["dark"].background}
        lightColor={Colors["light"].background}
      >
        {text1}
      </ThemedText>
      <ThemedText type="bodyLarge" onPress={hide}>
        ✖
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
});
