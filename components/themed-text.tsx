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
    fontFamily: "BricolageGrotesque-ExtraBold",
    fontSize: 64,
    lineHeight: 64 * 1.55,
    letterSpacing: 0.015,
  },
  displayMedium: {
    fontFamily: "BricolageGrotesque-ExtraBold",
    fontSize: 48,
    lineHeight: 48 * 1.55,
    letterSpacing: 0.015,
  },
  h1: {
    fontFamily: "BricolageGrotesque-Bold",
    fontSize: 31.25,
    lineHeight: 31.25 * 1.55,
    letterSpacing: 0.02,
  },
  h2: {
    fontFamily: "BricolageGrotesque-SemiBold",
    fontSize: 25,
    lineHeight: 25 * 1.55,
    letterSpacing: 0.02,
  },
  h3: {
    fontFamily: "BricolageGrotesque-SemiBold",
    fontSize: 22.36,
    lineHeight: 22.36 * 1.6,
    letterSpacing: 0.025,
  },
  h4: {
    fontFamily: "BricolageGrotesque-Medium",
    fontSize: 20,
    lineHeight: 20 * 1.6,
    letterSpacing: 0.025,
  },
  h5: {
    fontFamily: "BricolageGrotesque-Medium",
    fontSize: 18.91,
    lineHeight: 18.91 * 1.6,
    letterSpacing: 0.03,
  },
  h6: {
    fontFamily: "BricolageGrotesque-Medium",
    fontSize: 17.89,
    lineHeight: 17.89 * 1.6,
    letterSpacing: 0.03,
  },
  bodyLarge: {
    fontFamily: "BricolageGrotesque-Regular",
    fontSize: 16.92,
    lineHeight: 16.92 * 1.6,
    letterSpacing: 0.03,
  },
  body: {
    fontFamily: "BricolageGrotesque-Regular",
    fontSize: 16,
    lineHeight: 16 * 1.6,
    letterSpacing: 0.03,
  },
  bodySmall: {
    fontFamily: "BricolageGrotesque-Light",
    fontSize: 15.13,
    lineHeight: 15.13 * 1.65,
    letterSpacing: 0.03,
  },
  captionLarge: {
    fontFamily: "BricolageGrotesque-Light",
    fontSize: 14.31,
    lineHeight: 14.31 * 1.65,
    letterSpacing: 0.03,
  },
  caption: {
    fontFamily: "BricolageGrotesque-Light",
    fontSize: 13.53,
    lineHeight: 13.53 * 1.65,
    letterSpacing: 0.03,
  },
  captionSmall: {
    fontFamily: "BricolageGrotesque-ExtraLight",
    fontSize: 12.8,
    lineHeight: 12.8 * 1.65,
    letterSpacing: 0.03,
  },
  overline: {
    fontFamily: "BricolageGrotesque-Medium",
    fontSize: 13.53,
    lineHeight: 13.53 * 1.65,
    letterSpacing: 0.03,
    textTransform: "uppercase",
  },
  link: {
    color: "#0a7ea4",
    textDecorationLine: "underline",
  },
});
