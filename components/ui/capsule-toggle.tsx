import { Motion } from "@/constants/motion";
import { Colors } from "@/constants/theme";
import { ComponentType, useEffect } from "react";
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
  const bgColor = Colors[colorScheme ?? "light"].background;
  const color = Colors[colorScheme ?? "light"].text;

  const baseScale = useSharedValue(Motion.scale.default);
  const pressScale = useSharedValue(Motion.scale.default);

  useEffect(() => {
    baseScale.value = withTiming(
      selected ? Motion.scale.focus : Motion.scale.default,
      { duration: Motion.duration.fast }
    );
  }, [selected, baseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: baseScale.value * pressScale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressScale.value = withTiming(Motion.scale.press, {
          duration: Motion.duration.fast,
        });
      }}
      onPressOut={() => {
        pressScale.value = withTiming(Motion.scale.default, {
          duration: Motion.duration.fast,
        });
      }}
    >
      <Animated.View
        style={[
          styles.button,
          animatedStyle,
          {
            backgroundColor: selected ? bgFocused : bgColor,
            borderColor: bgFocused,
          },
        ]}
      >
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    gap: 5,
    borderWidth: 2,
  },
});
