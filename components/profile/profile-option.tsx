import { Colors } from "@/constants/theme";
import { PropsWithChildren } from "react";
import { Pressable, useColorScheme } from "react-native";
import { ThemedText } from "../themed-text";

export default function ProfileOption({
  children,
  text,
  onPress,
}: PropsWithChildren & { text: string; onPress: () => void }) {
  const colorScheme = useColorScheme();
  return (
    <Pressable
      style={{
        borderTopWidth: 1,
        borderColor: Colors[colorScheme ?? "light"].primary[300],
        paddingVertical: 2,
      }}
      onPress={onPress}
    >
      <ThemedText type="body">{text}</ThemedText>
      {children}
    </Pressable>
  );
}
