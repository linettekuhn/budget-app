import calculateSvgArcPath from "@/utils/calcuateSvgArcPath";
import mixColors from "@/utils/mixColors";
import { useEffect } from "react";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { G, Path } from "react-native-svg";

type Props = {
  categoryColor: string;
  bgColor: string;
  bgArcPath: string;
  startAngle: number;
  radius: number;
  centerX: number;
  centerY: number;
  strokeWidth: number;
  fillAngleSpan: number;
  overflowAngleSpan: number;
  spentPercent: number;
  overflowPercent: number;
  index: number;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function AnimatedArc({
  categoryColor,
  bgColor,
  bgArcPath,
  startAngle,
  radius,
  centerX,
  centerY,
  strokeWidth,
  fillAngleSpan,
  overflowAngleSpan,
  spentPercent,
  overflowPercent,
  index,
}: Props) {
  const fillProgress = useSharedValue(0);
  const overflowProgress = useSharedValue(0);

  useEffect(() => {
    // stagger based on index
    const delay = index * 150;

    // animate fill
    fillProgress.value = withDelay(delay, withTiming(1, { duration: 800 }));

    // animate overflow after fill
    if (overflowPercent > 0) {
      overflowProgress.value = withDelay(
        delay + 800,
        withTiming(1, { duration: 400 })
      );
    }
  }, [fillProgress, index, overflowPercent, overflowProgress]);

  const fillAnimatedProps = useAnimatedProps(() => {
    const animatedAngleSpan = fillAngleSpan * fillProgress.value;
    const path = calculateSvgArcPath(
      startAngle,
      radius,
      animatedAngleSpan,
      centerX,
      centerY
    );

    return { d: path };
  });

  const overflowAnimatedProps = useAnimatedProps(() => {
    const animatedAngleSpan = overflowAngleSpan * overflowProgress.value;
    const path = calculateSvgArcPath(
      startAngle,
      radius,
      animatedAngleSpan,
      centerX,
      centerY
    );

    return { d: path };
  });

  const overflowColor = mixColors(categoryColor, "#ff0000", 70);

  return (
    <G>
      <Path
        d={bgArcPath}
        stroke={bgColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      {spentPercent > 0 && (
        <AnimatedPath
          animatedProps={fillAnimatedProps}
          stroke={categoryColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      )}
      {overflowPercent > 0 && (
        <AnimatedPath
          animatedProps={overflowAnimatedProps}
          stroke={overflowColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      )}
    </G>
  );
}
