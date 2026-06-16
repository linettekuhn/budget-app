import { Platform } from "react-native";

export type ThemeKey = keyof typeof Colors; // "light" | "dark"

export function getTheme(colorScheme: string | null | undefined): ThemeKey {
  return colorScheme === "dark" ? "dark" : "light";
}

export const Colors = {
  light: {
    primary: {
      900: "#170015", // darkest (text)
      800: "#5e0b57",
      700: "#ab39a0ff",
      600: "#d61fc4",
      500: "#FF00E5", // base accent
      400: "#ff66ef",
      300: "#FFB9F8",
      200: "#FFD0FA",
      100: "#FFF1FE", // lightest
      50: "#fafafa",
    },

    secondary: {
      500: "#DA9DF7", // secondary accent
    },

    background: "#FFF1FE",
    text: "#170015",
    tabBackground: "#391A36",
    error: "#A10000",
    income: {
      900: "#0f3d1f",
      800: "#1f6b38",
      700: "#2c8745",
      600: "#3fa65a",
      500: "#5dd07c", // base
      400: "#7ee09a",
      300: "#a8e6b8",
      200: "#c9f2d2",
      100: "#e9fbec",
    },
    expense: {
      900: "#5a1a1a",
      800: "#8c2f2f",
      700: "#b44444",
      600: "#d35252",
      500: "#df5b5b", // base
      400: "#e87c7c",
      300: "#f2a3a3",
      200: "#f7caca",
      100: "#fdeeee",
    },
  },

  dark: {
    primary: {
      900: "#FFF1FE", // lightest (text)
      800: "#ffd6fb",
      700: "#FFB9F8",
      600: "#e87de0",
      500: "#B600A4", // base accent
      400: "#8a007c",
      300: "#64005A",
      200: "#2D0029",
      100: "#170015", // darkest
      50: "#000000",
    },

    secondary: {
      500: "#6D00A2",
    },

    background: "#170015",
    text: "#FFF1FE",
    tabBackground: "#FFDEFD",
    error: "#FF5C5C",
    income: {
      900: "#e9fbec",
      800: "#c9f2d2",
      700: "#a8e6b8",
      600: "#7ee09a",
      500: "#2c8745", // base (your current dark income)
      400: "#226c37",
      300: "#1a522a",
      200: "#133b1e",
      100: "#0b2413",
    },

    expense: {
      900: "#fdeeee",
      800: "#f7caca",
      700: "#f2a3a3",
      600: "#e87c7c",
      500: "#cf3d3d", // base (your current dark expense)
      400: "#a83232",
      300: "#7f2626",
      200: "#591b1b",
      100: "#331010",
    },
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
