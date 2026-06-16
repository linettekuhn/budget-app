import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, type TextProps, View } from "react-native";
import { AutoSizeText, ResizeTextMode } from "react-native-auto-size-text";

type TextType =
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

type Props = TextProps & {
  text: string;
  type?: TextType;
  minFontSize?: number;
  lightColor?: string;
  darkColor?: string;
};

const typeMeta: Record<
  TextType,
  { fontFamily: string; fontSize: number; letterSpacing: number }
> = {
  displayLarge: {
    fontFamily: "Onest-ExtraBold",
    fontSize: 40,
    letterSpacing: 0.015,
  },
  displayMedium: {
    fontFamily: "Onest-ExtraBold",
    fontSize: 36,
    letterSpacing: 0.015,
  },
  h1: { fontFamily: "Onest-Bold", fontSize: 32, letterSpacing: 0.02 },
  h2: { fontFamily: "Onest-SemiBold", fontSize: 24, letterSpacing: 0.02 },
  h3: { fontFamily: "Onest-SemiBold", fontSize: 22, letterSpacing: 0.025 },
  h4: { fontFamily: "Onest-Medium", fontSize: 20, letterSpacing: 0.025 },
  h5: { fontFamily: "Onest-Medium", fontSize: 18.91, letterSpacing: 0.03 },
  h6: { fontFamily: "Onest-Medium", fontSize: 17.89, letterSpacing: 0.03 },
  bodyLarge: {
    fontFamily: "Onest-Regular",
    fontSize: 16.92,
    letterSpacing: 0.03,
  },
  body: { fontFamily: "Onest-Regular", fontSize: 16, letterSpacing: 0.03 },
  bodySmall: {
    fontFamily: "Onest-Light",
    fontSize: 15.13,
    letterSpacing: 0.03,
  },
  captionLarge: {
    fontFamily: "Onest-Light",
    fontSize: 14.31,
    letterSpacing: 0.03,
  },
  caption: { fontFamily: "Onest-Light", fontSize: 13.53, letterSpacing: 0.03 },
  captionSmall: {
    fontFamily: "Onest-ExtraLight",
    fontSize: 12.8,
    letterSpacing: 0.03,
  },
  overline: {
    fontFamily: "Onest-Medium",
    fontSize: 13.53,
    letterSpacing: 0.03,
  },
  link: {
    fontFamily: "Onest-ExtraLight",
    fontSize: 13.53,
    letterSpacing: 0.03,
  },
};

export function FitText({
  text,
  type = "body",
  minFontSize = 12,
  lightColor,
  darkColor,
  style,
  ...rest
}: Props) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const { fontFamily, fontSize, letterSpacing } = typeMeta[type];

  return (
    <View style={styles.container}>
      <AutoSizeText
        fontSize={fontSize}
        numberOfLines={1}
        mode={ResizeTextMode.max_lines}
        style={[
          {
            color,
            fontFamily,
            letterSpacing,
            textAlign: "center",
          },
          style,
        ]}
      >
        {text}
      </AutoSizeText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
