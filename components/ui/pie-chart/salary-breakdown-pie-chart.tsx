import { CategorySpend, Salary } from "@/types";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import calculateArcData from "@/utils/calculateArcData";
import { useColorScheme, View } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import tinycolor from "tinycolor2";
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
  const needsBgColor = tinycolor(needsColor).setAlpha(0.4).toRgbString();
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
  startAngle += needsAngleSpan;

  // Wants Arc
  const wantsColor = adjustColorForScheme("#8F53C7", colorScheme, 0.2);
  const wantsBgColor = tinycolor(wantsColor).setAlpha(0.4).toRgbString();
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
                color={needsColor}
              />
              <Path
                d={needsArcData.bgArcPath}
                stroke={needsBgColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
              />
              {needsArcData.spentPercent > 0 && (
                <Path
                  d={needsArcData.fillArcPath}
                  stroke={needsColor}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                />
              )}
              {needsArcData.overflowPercent > 0 && (
                <Path
                  d={needsArcData.overflowArcPath}
                  stroke="red"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                />
              )}
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
                color={wantsColor}
              />
              <Path
                d={wantsArcData.bgArcPath}
                stroke={wantsBgColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
              />
              {wantsArcData.spentPercent > 0 && (
                <Path
                  d={wantsArcData.fillArcPath}
                  stroke={wantsColor}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                />
              )}
              {wantsArcData.overflowPercent > 0 && (
                <Path
                  d={wantsArcData.overflowArcPath}
                  stroke="red"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                />
              )}
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
              <Path
                d={savedArcData.bgArcPath}
                stroke={savedBgColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
              />
              {savedArcData.spentPercent > 0 && (
                <Path
                  d={savedArcData.fillArcPath}
                  stroke={savedColor}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                />
              )}
              {savedArcData.overflowPercent > 0 && (
                <Path
                  d={savedArcData.overflowArcPath}
                  stroke="red"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                />
              )}
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
          color={wantsColor}
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
          color={needsColor}
          label="Needs"
        />
      )}
    </View>
  );
}
