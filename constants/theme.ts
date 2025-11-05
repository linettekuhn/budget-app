import { Platform } from "react-native";

export const Colors = {
  light: {
    primary: {
      900: "#170015", // darkest (text on light background)
      700: "#ab39a0ff", // darker
      500: "#FF00E5", // primary accent
      300: "#FFB9F8", // lighter
      100: "#FFF1FE", // lightest (contrast text)
    },

    secondary: {
      500: "#DA9DF7", // secondary accent
    },

    background: "#FFF1FE",
    text: "#170015",
    tabBackground: "#391A36",
  },

  dark: {
    primary: {
      900: "#FFF1FE", // lightest (text on dark background)
      700: "#FFB9F8", // lighter
      500: "#B600A4", // primary accent
      300: "#ab39a0ff", // darker
      100: "#170015", // darkest (contrast text)
    },

    secondary: {
      500: "#6D00A2",
    },

    background: "#170015",
    text: "#FFF1FE",
    tabBackground: "#FFDEFD",
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
