import { Motion } from "@/constants/motion";
import { Colors } from "@/constants/theme";
import Octicons from "@expo/vector-icons/Octicons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import tinycolor from "tinycolor2";
import { ThemedText } from "../themed-text";
import AppModal from "./modal/modal";

type Option = { label: string; value: any };

type Props = {
  value: any;
  options: Option[];
  onChange: (value: any) => void;
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

export default function CapsuleDropdown({
  value,
  options,
  onChange,
  textType,
}: Props) {
  const [open, setOpen] = useState(false);
  const colorScheme = useColorScheme();
  const bgColor = Colors[colorScheme ?? "light"].primary[300];
  const color = Colors[colorScheme ?? "light"].text;

  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? "";

  const focusColor =
    colorScheme === "dark"
      ? tinycolor(bgColor).lighten(10).toHexString()
      : tinycolor(bgColor).darken(10).toHexString();

  const baseScale = useSharedValue(Motion.scale.default);
  const pressScale = useSharedValue(Motion.scale.default);
  const rotate = useSharedValue(0);

  useEffect(() => {
    baseScale.value = withTiming(
      open ? Motion.scale.focus : Motion.scale.default,
      { duration: Motion.duration.fast }
    );
    rotate.value = withTiming(open ? 180 : 0, {
      duration: Motion.duration.normal,
    });
  }, [open, baseScale, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: baseScale.value * pressScale.value }],
  }));
  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));
  return (
    <View style={{ zIndex: 10 }}>
      <Animated.View style={[animatedStyle]}>
        <Pressable
          style={[
            styles.button,
            {
              backgroundColor: bgColor,
              borderColor: open ? focusColor : bgColor,
            },
          ]}
          onPress={() => setOpen((prev) => !prev)}
        >
          <ThemedText type={textType} style={{ color: color }}>
            {selectedLabel}
          </ThemedText>
          <Animated.View style={animatedArrowStyle}>
            <Octicons name="chevron-down" size={17} color={color} />
          </Animated.View>
        </Pressable>
      </Animated.View>
      <AppModal visible={open} onClose={() => setOpen(false)}>
        <View style={[styles.dropdown]}>
          {options.map((item) => (
            <Pressable
              key={item.value}
              onPress={() => {
                onChange(item.value);
                setOpen(false);
              }}
              style={[
                styles.option,
                {
                  borderColor: bgColor,
                  backgroundColor: Colors[colorScheme ?? "light"].background,
                },
              ]}
            >
              <ThemedText type={textType} style={{ color: color }}>
                {item.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </AppModal>
    </View>
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
    borderWidth: 4,
    alignSelf: "center",
  },

  dropdown: {
    paddingHorizontal: 12,
    gap: 8,
  },

  option: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderRadius: 25,
    alignItems: "center",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 900,
  },
});
