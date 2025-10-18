import { Colors } from "@/constants/theme";
import { ComponentType } from "react";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import { ThemedText } from "../themed-text";

type Props = {
  text: string;
  onPress: () => void;
  selected: boolean;
  bgFocused: string;
  textColor?: string;
  IconComponent?: ComponentType<any>;
  iconName?: string;
};

export default function CapsuleToggle({
  text,
  onPress,
  bgFocused,
  textColor,
  IconComponent,
  iconName,
  selected,
}: Props) {
  const colorScheme = useColorScheme();
  const bgDefault = Colors[colorScheme ?? "light"].capsuleButtonDefault;
  const color = Colors[colorScheme ?? "light"].text;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: selected ? bgFocused : bgDefault },
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
    alignSelf: "flex-start",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    gap: 5,
  },
});
