/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#DA9DF7";
const tintColorDark = "#8C17C4";

export const Colors = {
  light: {
    text: "#2B2B2B",
    background: "#E8E8E1",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#E8E8E1",
    tabIconSelected: tintColorLight,
    capsuleButtonDefault: "#C6C6C6",
    tabsColor: "#4C4C4C",
    secondary1: "#F9A5A5",
    backgroundLight: "#3A3A3A",
  },
  dark: {
    text: "#ECEDEE",
    background: "#3A3A39",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#3A3A39",
    tabIconSelected: tintColorDark,
    capsuleButtonDefault: "#595959",
    tabsColor: "#B4B4B4",
    secondary1: "#B73684",
    backgroundLight: "#C5C5C5",
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
