import { Colors } from "@/constants/theme";
import { CategorySpend } from "@/types";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import calculateSvgArcPath from "@/utils/calcuateSvgArcPath";
import { useColorScheme } from "react-native";
import Svg, { G } from "react-native-svg";
import tinycolor from "tinycolor2";
import AnimatedArc from "./animated-arc";

type Props = {
  budgets: CategorySpend[];
};
export default function MonthlyBudgetPieChart({ budgets }: Props) {
  const colorScheme = useColorScheme();

  const sortedBudgets = [...budgets].sort((a, b) => b.budget - a.budget);
  const topThree = sortedBudgets.slice(0, 3);
  const other = sortedBudgets.slice(3);

  const displayBudgets = [...topThree];
  const otherTotal = other.reduce((sum, category) => sum + category.budget, 0);
  const otherTotalSpent = other.reduce(
    (sum, category) => sum + category.totalSpent,
    0
  );

  if (otherTotal > 0) {
    displayBudgets.push({
      id: "",
      name: "Other",
      color: adjustColorForScheme("#B6B6B6", colorScheme),
      budget: otherTotal,
      totalSpent: otherTotalSpent,
      type: "need",
    });
  }

  const gap = 0.3;
  const size = 280;
  const center = size / 2;
  const radius = (size - 50) / 2;
  const strokeWidth = 24;
  let startAngle = -(Math.PI / 2);
  const total = displayBudgets.reduce(
    (sum, category) => sum + category.budget,
    0
  );
  return (
    <Svg width={size} height={size}>
      <G>
        {displayBudgets.map((category, index) => {
          const categoryColor = adjustColorForScheme(
            category.color,
            colorScheme,
            30
          );
          const screenBgColor = Colors[colorScheme ?? "light"].background;
          const bgColor = tinycolor
            .mix(screenBgColor, categoryColor, 40)
            .toHexString();

          const budgetPercent = category.budget / total;
          const totalAngleSpan = budgetPercent * (2 * Math.PI);
          const drawableAngle = totalAngleSpan - gap;

          let spentPercent = category.totalSpent / category.budget;
          let overflowPercent = 0;

          if (spentPercent >= 1) {
            overflowPercent = Math.abs(1 - spentPercent);
            spentPercent = 1;
          }

          if (overflowPercent >= 1) {
            overflowPercent = 1;
          }

          const fillAngleSpan = spentPercent * drawableAngle;
          const overflowAngleSpan = overflowPercent * drawableAngle;

          const bgArcPath = calculateSvgArcPath(
            startAngle,
            radius,
            drawableAngle,
            center,
            center
          );

          const currentStartAngle = startAngle;
          startAngle += totalAngleSpan;

          return (
            <AnimatedArc
              key={category.id}
              categoryColor={categoryColor}
              bgColor={bgColor}
              bgArcPath={bgArcPath}
              startAngle={currentStartAngle}
              radius={radius}
              centerX={center}
              centerY={center}
              strokeWidth={strokeWidth}
              fillAngleSpan={fillAngleSpan}
              overflowAngleSpan={overflowAngleSpan}
              spentPercent={spentPercent}
              overflowPercent={overflowPercent}
              index={index}
            />
          );
        })}
      </G>
    </Svg>
  );
}
