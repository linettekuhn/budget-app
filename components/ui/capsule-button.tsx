import { Motion } from "@/constants/motion";
import { Colors } from "@/constants/theme";
import { ComponentType } from "react";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "../themed-text";

type Props = {
  text: string;
  onPress: () => void;
  bgFocused: string;
  bgDefault?: string;
  textColor?: string;
  IconComponent?: ComponentType<any>;
  iconName?: string;
  disabled?: boolean;
};

export default function CapsuleButton({
  text,
  onPress,
  bgFocused,
  bgDefault,
  textColor,
  IconComponent,
  iconName,
  disabled = false,
}: Props) {
  const colorScheme = useColorScheme();
  const bgColor = bgDefault ?? Colors[colorScheme ?? "light"].primary[300];
  const color = Colors[colorScheme ?? "light"].text;

  const scale = useSharedValue(Motion.scale.default);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      onPressIn={() => {
        scale.value = withTiming(Motion.scale.press, {
          duration: Motion.duration.fast,
        });
      }}
      onPressOut={() => {
        scale.value = withTiming(Motion.scale.default, {
          duration: Motion.duration.fast,
        });
      }}
      style={({ pressed }) => [
        styles.button,
        {
          opacity: disabled ? 0.6 : 1,
          backgroundColor: disabled
            ? Colors[colorScheme ?? "light"].primary[200]
            : pressed
            ? bgFocused
            : bgColor,
        },
      ]}
    >
      <Animated.View style={[styles.content, animatedStyle]}>
        {IconComponent && iconName && (
          <IconComponent name={iconName} size={17} color={textColor ?? color} />
        )}
        <ThemedText type="bodyLarge" style={{ color: textColor ?? color }}>
          {text}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
  },

  content: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },
});
