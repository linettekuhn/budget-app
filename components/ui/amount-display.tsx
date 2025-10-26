import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useRef } from "react";
import { Pressable, StyleSheet, TextInput, useColorScheme } from "react-native";

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
  const inputRef = useRef<TextInput>(null);

  return (
    <ThemedView style={styles.amountWrapper}>
      <Pressable onPress={() => inputRef.current?.focus()}>
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
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  amountWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    position: "relative",
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
