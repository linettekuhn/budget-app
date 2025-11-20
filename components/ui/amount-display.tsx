import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
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

  return (
    <View>
      <Pressable
        style={[
          styles.amountWrapper,
          {
            backgroundColor: bgColor,
            borderColor: focused ? focusColor : bgColor,
          },
        ]}
        onPress={() => {
          inputRef.current?.focus();
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
    </View>
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
