import { Motion } from "@/constants/motion";
import { useFocusEffect } from "expo-router";
import { PropsWithChildren, useCallback } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type EnterAnimationType = "fade" | "slideRight" | "slideUp" | "zoom";

type Props = {
  entering?: EnterAnimationType;
  duration?: number;
};

export default function AnimatedScreen({
  entering = "zoom",
  duration = Motion.duration.normal,
  children,
}: PropsWithChildren<Props>) {
  // initial values
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(50);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.95);

  useFocusEffect(
    useCallback(() => {
      // reset to initial values
      opacity.value = 0;
      if (entering === "slideRight") {
        translateX.value = 50;
      } else if (entering === "slideUp") {
        translateY.value = -30;
      } else if (entering === "zoom") {
        scale.value = 0.95;
      }

      // animate entering
      opacity.value = withTiming(1, { duration: duration });
      translateX.value = withTiming(0, { duration: duration });
      translateY.value = withTiming(0, { duration: duration });
      scale.value = withTiming(1, { duration: duration });
    }, [entering, duration])
  );

  const animatedStyle = useAnimatedStyle(() => {
    switch (entering) {
      case "fade":
        return { opacity: opacity.value };
      case "slideRight":
        return {
          opacity: opacity.value,
          transform: [{ translateX: translateX.value }],
        };
      case "slideUp":
        return {
          opacity: opacity.value,
          transform: [{ translateY: translateY.value }],
        };
      case "zoom":
        return {
          opacity: opacity.value,
          transform: [{ scale: scale.value }],
        };
      default:
        return { opacity: opacity.value };
    }
  });

  return (
    <Animated.View style={[animatedStyle, { flex: 1 }]}>
      {children}
    </Animated.View>
  );
}
