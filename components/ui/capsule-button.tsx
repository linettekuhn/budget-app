import { Colors } from "@/constants/theme";
import { ComponentType } from "react";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import { ThemedText } from "../themed-text";

type Props = {
  text: string;
  onPress: () => void;
  bgFocused: string;
  textColor?: string;
  IconComponent?: ComponentType<any>;
  iconName?: string;
};

export default function CapsuleButton({
  text,
  onPress,
  bgFocused,
  textColor,
  IconComponent,
  iconName,
}: Props) {
  const colorScheme = useColorScheme();
  const bgDefault = Colors[colorScheme ?? "light"].primary[300];
  const color = Colors[colorScheme ?? "light"].text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? bgFocused : bgDefault,
        },
      ]}
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
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 15,
  },
});
