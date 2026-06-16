import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export function useTabBarPadding() {
  try {
    return useBottomTabBarHeight();
  } catch {
    return 0;
  }
}
