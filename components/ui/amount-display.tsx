import { ThemedText } from "@/components/themed-text";
import { Motion } from "@/constants/motion";
import { Colors } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, useColorScheme } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import tinycolor from "tinycolor2";

type AmountDisplayProps = {
  displayAmount: string;
  rawAmount: string;
  onChangeText: (text: string) => void;
  textType?:
    | "displayLarge"
    | "displayMedium"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "body"
    | "bodyLarge"
    | "bodySmall"
    | "caption"
    | "captionLarge"
    | "captionSmall"
    | "overline"
    | "link";
};

export default function AmountDisplay({
  displayAmount,
  rawAmount,
  onChangeText,
  textType,
}: AmountDisplayProps) {
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? "light"].text;
  const bgColor = Colors[colorScheme ?? "light"].primary[300];
  const inputRef = useRef<TextInput>(null);
  const focusColor =
    colorScheme === "dark"
      ? tinycolor(bgColor).lighten(10).toHexString()
      : tinycolor(bgColor).darken(10).toHexString();
  const [focused, setFocused] = useState(false);

  const baseScale = useSharedValue(Motion.scale.default);
  const pressScale = useSharedValue(Motion.scale.default);

  useEffect(() => {
    baseScale.value = withTiming(
      focused ? Motion.scale.focus : Motion.scale.default,
      { duration: Motion.duration.fast }
    );
  }, [focused, baseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: baseScale.value * pressScale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.amountWrapper,
        animatedStyle,
        {
          backgroundColor: bgColor,
          borderColor: focused ? focusColor : bgColor,
        },
      ]}
    >
      <Pressable
        onPress={() => {
          inputRef.current?.focus();
        }}
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
        <ThemedText
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.4}
          type={textType}
          style={[styles.amountInput, { color: textColor }]}
        >
          ${displayAmount}
        </ThemedText>
      </Pressable>

      <TextInput
        ref={inputRef}
        value={rawAmount}
        onChangeText={onChangeText}
        keyboardType="numeric"
        style={styles.hiddenInput}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  amountWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderRadius: 25,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 4,
  },
  amountInput: {
    textAlign: "center",
    alignSelf: "center",
    padding: 0,
    margin: 0,
    zIndex: 1,
    includeFontPadding: false,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
});
