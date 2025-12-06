import { Colors } from "@/constants/theme";
import Octicons from "@expo/vector-icons/Octicons";
import { ComponentType } from "react";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { ThemedText } from "../themed-text";

type Props = {
  text: string;
  onPress: () => void;
  textColor?: string;
  IconComponent?: ComponentType<any>;
  iconName?: string;
};

export default function ProfileButton({
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
      <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
        {IconComponent && iconName && (
          <IconComponent name={iconName} size={17} color={textColor ?? color} />
        )}
        <ThemedText type="bodyLarge" style={{ color: textColor ?? color }}>
          {text}
        </ThemedText>
      </View>
      <Octicons name="chevron-right" size={17} color={textColor ?? color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
  },
});
