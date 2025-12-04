import { Colors } from "@/constants/theme";
import { ComponentType } from "react";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import { ThemedText } from "../themed-text";

type Props = {
  text: string;
  onPress: () => void;
  textColor?: string;
  IconComponent?: ComponentType<any>;
  iconName?: string;
};

export default function TextButton({
  text,
  onPress,
  textColor,
  IconComponent,
  iconName,
}: Props) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"].text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.6 }]}
    >
      {IconComponent && iconName && (
        <IconComponent name={iconName} size={17} color={textColor ?? color} />
      )}
      <ThemedText type="bodyLarge" style={{ color: textColor ?? color }}>
        {text}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
});
