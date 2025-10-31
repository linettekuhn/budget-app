import { ColorSchemeName } from "react-native";
import tinyColor from "tinycolor2";

export default function adjustColorForScheme(
  color: string,
  colorScheme: ColorSchemeName,
  adjustAmount: number = 30
) {
  const c = tinyColor(color);

  if (colorScheme === "light" && c.isDark()) {
    c.lighten(adjustAmount);
  } else if (colorScheme === "dark" && c.isLight()) {
    c.darken(adjustAmount);
  }

  return c.toHexString();
}
