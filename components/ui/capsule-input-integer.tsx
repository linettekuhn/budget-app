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

type Props = {
  displayAmount: string;
  rawAmount: string;
  onChangeText: (text: string) => void;
  min?: number;
  max?: number;
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

export default function CapsuleNumberInteger({
  displayAmount,
  rawAmount,
  onChangeText,
  min,
  max,
  textType,
}: Props) {
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? "light"].text;
  const bgColor = Colors[colorScheme ?? "light"].primary[300];
  const inputRef = useRef<TextInput>(null);
  const focusColor =
    colorScheme === "dark"
      ? tinycolor(bgColor).lighten(10).toHexString()
      : tinycolor(bgColor).darken(10).toHexString();
  const [focused, setFocused] = useState(false);
  const [clearOnType, setClearOnType] = useState(false);

  const handleChange = (text: string) => {
    if (clearOnType) {
      setClearOnType(false);
      text = text.slice(-1);
    }

    // keep only whole numbers
    let filtered = text.replace(/[^0-9]/g, "");

    if (filtered === "") {
      onChangeText("");
      return;
    }

    let numeric = parseInt(filtered, 10);

    // apply min + max if provided
    if (min !== undefined && numeric < min) numeric = min;
    if (max !== undefined && numeric > max) numeric = max;

    onChangeText(numeric.toString());
  };

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
        onPress={() => inputRef.current?.focus()}
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
          {displayAmount}
        </ThemedText>
      </Pressable>

      <TextInput
        ref={inputRef}
        value={rawAmount}
        onChangeText={handleChange}
        keyboardType="number-pad"
        style={styles.hiddenInput}
        onFocus={() => {
          setFocused(true);
          setClearOnType(true);
        }}
        onBlur={() => {
          setFocused(false);
          setClearOnType(false);
        }}
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
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderWidth: 4,
  },
  amountInput: {
    textAlign: "center",
    padding: 0,
    margin: 0,
    zIndex: 1,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
});
