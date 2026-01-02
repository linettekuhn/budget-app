import { Motion } from "@/constants/motion";
import { Colors } from "@/constants/theme";
import { ComponentType, ReactNode, useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  useColorScheme,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import tinycolor from "tinycolor2";

type Props = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
  textColor?: string;
  placeholder?: string;
  IconComponent?: ComponentType<any>;
  iconName?: string;
  children?: ReactNode;
};

export default function CapsuleInput({
  value,
  onChangeText,
  textColor,
  placeholder,
  IconComponent,
  iconName,
  children,
  ...rest
}: Props) {
  const colorScheme = useColorScheme();
  const bgDefault = Colors[colorScheme ?? "light"].primary[300];
  const color = Colors[colorScheme ?? "light"].text;
  const inputRef = useRef<TextInput>(null);

  const focusColor =
    colorScheme === "dark"
      ? tinycolor(bgDefault).lighten(10).toHexString()
      : tinycolor(bgDefault).darken(10).toHexString();

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
      <Animated.View
        style={[
          styles.inputContainer,
          animatedStyle,
          {
            backgroundColor: bgDefault,
            borderColor: focused ? focusColor : bgDefault,
          },
        ]}
      >
        {IconComponent && iconName && (
          <IconComponent name={iconName} size={17} color={color + "88"} />
        )}
        <TextInput
          ref={inputRef}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.textInput, { color: textColor ?? color }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={color + "88"}
          {...rest}
        />
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 10,
    borderWidth: 4,
    height: 50,
    width: "100%",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
  },
});
