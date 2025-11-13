import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
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

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "body",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return <Text style={[{ color }, typeStyles[type], style]} {...rest} />;
}

const typeStyles = StyleSheet.create({
  displayLarge: {
    fontFamily: "Onest-ExtraBold",
    fontSize: 40,
    lineHeight: 40 * 1.55,
    letterSpacing: 0.015,
    textAlign: "center",
  },
  displayMedium: {
    fontFamily: "Onest-ExtraBold",
    fontSize: 36,
    lineHeight: 36 * 1.55,
    letterSpacing: 0.015,
    textAlign: "center",
  },
  h1: {
    fontFamily: "Onest-Bold",
    fontSize: 32,
    lineHeight: 32 * 1.55,
    letterSpacing: 0.02,
    textAlign: "center",
  },
  h2: {
    fontFamily: "Onest-SemiBold",
    fontSize: 24,
    lineHeight: 24 * 1.55,
    letterSpacing: 0.02,
    textAlign: "center",
  },
  h3: {
    fontFamily: "Onest-SemiBold",
    fontSize: 22,
    lineHeight: 22 * 1.6,
    letterSpacing: 0.025,
    textAlign: "center",
  },
  h4: {
    fontFamily: "Onest-Medium",
    fontSize: 20,
    lineHeight: 20 * 1.6,
    letterSpacing: 0.025,
    textAlign: "center",
  },
  h5: {
    fontFamily: "Onest-Medium",
    fontSize: 18.91,
    lineHeight: 18.91 * 1.6,
    letterSpacing: 0.03,
    textAlign: "center",
  },
  h6: {
    fontFamily: "Onest-Medium",
    fontSize: 17.89,
    lineHeight: 17.89 * 1.6,
    letterSpacing: 0.03,
    textAlign: "center",
  },
  bodyLarge: {
    fontFamily: "Onest-Regular",
    fontSize: 16.92,
    lineHeight: 16.92 * 1.6,
    letterSpacing: 0.03,
  },
  body: {
    fontFamily: "Onest-Regular",
    fontSize: 16,
    lineHeight: 16 * 1.6,
    letterSpacing: 0.03,
  },
  bodySmall: {
    fontFamily: "Onest-Light",
    fontSize: 15.13,
    lineHeight: 15.13 * 1.65,
    letterSpacing: 0.03,
  },
  captionLarge: {
    fontFamily: "Onest-Light",
    fontSize: 14.31,
    lineHeight: 14.31 * 1.65,
    letterSpacing: 0.03,
  },
  caption: {
    fontFamily: "Onest-Light",
    fontSize: 13.53,
    lineHeight: 13.53 * 1.65,
    letterSpacing: 0.03,
  },
  captionSmall: {
    fontFamily: "Onest-ExtraLight",
    fontSize: 12.8,
    lineHeight: 12.8 * 1.65,
    letterSpacing: 0.03,
  },
  overline: {
    fontFamily: "Onest-Medium",
    fontSize: 13.53,
    lineHeight: 13.53 * 1.65,
    letterSpacing: 0.03,
    textTransform: "uppercase",
  },
  link: {
    fontFamily: "Onest-ExtraLight",
    fontSize: 13.53,
    lineHeight: 13.53 * 1.65,
    letterSpacing: 0.03,
    textTransform: "uppercase",
    textDecorationLine: "underline",
  },
});
