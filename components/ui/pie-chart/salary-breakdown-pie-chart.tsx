import { Colors } from "@/constants/theme";
import { CategorySpend, Salary } from "@/types";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import calculateArcData from "@/utils/calculateArcData";
import { useColorScheme, View } from "react-native";
import Svg, { G } from "react-native-svg";
import tinycolor from "tinycolor2";
import AnimatedArc from "./animated-arc";
import {
  PieChartLabelConnectorLine,
  PieChartLabelText,
} from "./pie-chart-label";

type Props = {
  budgets: CategorySpend[];
  salary: Salary;
};
export default function SalaryBreakdownPieChart({ budgets, salary }: Props) {
  const colorScheme = useColorScheme();

  const wantsBudgets = [...budgets].filter((budget) => budget.type === "want");
  const needsBudgets = [...budgets].filter((budget) => budget.type === "need");
  const totalBudget = [...budgets].reduce(
    (sum, budget) => sum + budget.budget,
    0
  );
  const saved = salary.monthly - totalBudget;

  const wantsSpent = [...wantsBudgets].reduce(
    (sum, budget) => sum + budget.totalSpent,
    0
  );
  const wantsTotal = [...wantsBudgets].reduce(
    (sum, budget) => sum + budget.budget,
    0
  );
  const needsSpent = [...needsBudgets].reduce(
    (sum, budget) => sum + budget.totalSpent,
    0
  );
  const needsTotal = [...needsBudgets].reduce(
    (sum, budget) => sum + budget.budget,
    0
  );

  const screenBgColor = Colors[colorScheme ?? "light"].background;
  const gap = 0.3;
  const size = 240;
  const radius = (size - 50) / 2;
  const strokeWidth = 20;
  let startAngle = -(Math.PI / 2);
  const margin = 80;
  const viewBoxWidth = size + margin;
  const centerX = viewBoxWidth / 2;
  const centerY = size / 2;

  // Needs Arc
  const needsColor = adjustColorForScheme("#3BACE4", colorScheme, 0.2);
  const needsBgColor = tinycolor
    .mix(screenBgColor, needsColor, 40)
    .toHexString();
  const needsPercent = needsTotal / salary.monthly;
  const needsAngleSpan = needsPercent * (2 * Math.PI);
  const needsMiddleAngle = startAngle + needsAngleSpan / 2;
  const needsArcData = calculateArcData({
    spent: needsSpent,
    total: needsTotal,
    gap: gap,
    startAngle: startAngle,
    angleSpan: needsAngleSpan,
    radius: radius,
    centerX: centerX,
    centerY: centerY,
  });
  const needsStartAngle = startAngle;
  startAngle += needsAngleSpan;

  // Wants Arc
  const wantsColor = adjustColorForScheme("#8F53C7", colorScheme, 0.2);
  const wantsBgColor = tinycolor
    .mix(screenBgColor, wantsColor, 40)
    .toHexString();
  const wantsPercent = wantsTotal / salary.monthly;
  const wantsAngleSpan = wantsPercent * (2 * Math.PI);
  const wantsMiddleAngle = startAngle + wantsAngleSpan / 2;
  const wantsArcData = calculateArcData({
    spent: wantsSpent,
    total: wantsTotal,
    gap: gap,
    startAngle: startAngle,
    angleSpan: wantsAngleSpan,
    radius: radius,
    centerX: centerX,
    centerY: centerY,
  });
  const wantsStartAngle = startAngle;
  startAngle += wantsAngleSpan;

  // Saved Arc
  const savedColor = adjustColorForScheme("#35D17E", colorScheme, 10);
  const savedBgColor = tinycolor(savedColor).setAlpha(0.4).toRgbString();
  const savedPercent = saved / salary.monthly;
  const savedAngleSpan = savedPercent * (2 * Math.PI);
  const savedMiddleAngle = startAngle + savedAngleSpan / 2;
  const savedArcData = calculateArcData({
    spent: saved,
    total: saved,
    gap: gap,
    startAngle: startAngle,
    angleSpan: savedAngleSpan,
    radius: radius,
    centerX: centerX,
    centerY: centerY,
  });
  const savedStartAngle = startAngle;

  return (
    <View style={{ width: viewBoxWidth, height: size, position: "relative" }}>
      <Svg width={viewBoxWidth} height={size}>
        <G>
          {needsTotal > 0 && (
            <G key={"needs"}>
              <PieChartLabelConnectorLine
                middleAngle={needsMiddleAngle}
                centerX={centerX}
                centerY={centerY}
                radius={radius}
                strokeWidth={strokeWidth}
                color={
                  needsArcData.spentPercent > 0.5 ? needsColor : needsBgColor
                }
              />
              <AnimatedArc
                categoryColor={needsColor}
                bgColor={needsBgColor}
                bgArcPath={needsArcData.bgArcPath}
                startAngle={needsStartAngle}
                radius={radius}
                centerX={centerX}
                centerY={centerY}
                strokeWidth={strokeWidth}
                fillAngleSpan={needsArcData.fillAngleSpan}
                overflowAngleSpan={needsArcData.overflowAngleSpan}
                spentPercent={needsArcData.spentPercent}
                overflowPercent={needsArcData.overflowPercent}
                index={0}
              />
            </G>
          )}

          {wantsTotal > 0 && (
            <G key={"wants"}>
              <PieChartLabelConnectorLine
                middleAngle={wantsMiddleAngle}
                centerX={centerX}
                centerY={centerY}
                radius={radius}
                strokeWidth={strokeWidth}
                color={
                  wantsArcData.spentPercent > 0.5 ? wantsColor : wantsBgColor
                }
              />
              <AnimatedArc
                categoryColor={wantsColor}
                bgColor={wantsBgColor}
                bgArcPath={wantsArcData.bgArcPath}
                startAngle={wantsStartAngle}
                radius={radius}
                centerX={centerX}
                centerY={centerY}
                strokeWidth={strokeWidth}
                fillAngleSpan={wantsArcData.fillAngleSpan}
                overflowAngleSpan={wantsArcData.overflowAngleSpan}
                spentPercent={wantsArcData.spentPercent}
                overflowPercent={wantsArcData.overflowPercent}
                index={1}
              />
            </G>
          )}

          {saved > 0 && (
            <G key={"saved"}>
              <PieChartLabelConnectorLine
                middleAngle={savedMiddleAngle}
                centerX={centerX}
                centerY={centerY}
                radius={radius}
                strokeWidth={strokeWidth}
                color={savedColor}
              />
              <AnimatedArc
                categoryColor={savedColor}
                bgColor={savedBgColor}
                bgArcPath={savedArcData.bgArcPath}
                startAngle={savedStartAngle}
                radius={radius}
                centerX={centerX}
                centerY={centerY}
                strokeWidth={strokeWidth}
                fillAngleSpan={savedArcData.fillAngleSpan}
                overflowAngleSpan={savedArcData.overflowAngleSpan}
                spentPercent={savedArcData.spentPercent}
                overflowPercent={savedArcData.overflowPercent}
                index={2}
              />
            </G>
          )}
        </G>
      </Svg>
      {saved > 0 && (
        <PieChartLabelText
          middleAngle={savedMiddleAngle}
          centerX={centerX}
          centerY={centerY}
          radius={radius}
          strokeWidth={strokeWidth}
          color={savedColor}
          label="Savings"
        />
      )}
      {wantsTotal > 0 && (
        <PieChartLabelText
          middleAngle={wantsMiddleAngle}
          centerX={centerX}
          centerY={centerY}
          radius={radius}
          strokeWidth={strokeWidth}
          color={wantsArcData.spentPercent > 0.5 ? wantsColor : wantsBgColor}
          label="Wants"
        />
      )}
      {needsTotal > 0 && (
        <PieChartLabelText
          middleAngle={needsMiddleAngle}
          centerX={centerX}
          centerY={centerY}
          radius={radius}
          strokeWidth={strokeWidth}
          color={needsArcData.spentPercent > 0.5 ? needsColor : needsBgColor}
          label="Needs"
        />
      )}
    </View>
  );
}
