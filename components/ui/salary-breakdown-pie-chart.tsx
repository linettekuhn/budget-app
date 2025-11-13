import { CategorySpend, Salary } from "@/types";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import calculateArcData from "@/utils/calculateArcData";
import { useColorScheme } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import tinycolor from "tinycolor2";

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
  const size = 260;
  const center = size / 2;
  const radius = (size - 50) / 2;
  const strokeWidth = 25;
  let startAngle = -(Math.PI / 2);

  // Needs Arc
  const needsColor = adjustColorForScheme("#1A9FE0", colorScheme);
  const needsBgColor = tinycolor(needsColor).setAlpha(0.4).toRgbString();
  const needsPercent = needsTotal / salary.monthly;
  const needsAngleSpan = needsPercent * (2 * Math.PI);
  const needsArcData = calculateArcData({
    spent: needsSpent,
    total: needsTotal,
    gap: gap,
    startAngle: startAngle,
    angleSpan: needsAngleSpan,
    radius: radius,
    center: center,
  });
  startAngle += needsAngleSpan;

  // Wants Arc
  const wantsColor = adjustColorForScheme("#53C772", colorScheme);
  const wantsBgColor = tinycolor(wantsColor).setAlpha(0.4).toRgbString();
  const wantsPercent = wantsTotal / salary.monthly;
  const wantsAngleSpan = wantsPercent * (2 * Math.PI);
  const wantsArcData = calculateArcData({
    spent: wantsSpent,
    total: wantsTotal,
    gap: gap,
    startAngle: startAngle,
    angleSpan: wantsAngleSpan,
    radius: radius,
    center: center,
  });
  startAngle += wantsAngleSpan;

  // Saved Arc
  const savedColor = adjustColorForScheme("#E99A1B", colorScheme, 10);
  const savedBgColor = tinycolor(savedColor).setAlpha(0.4).toRgbString();
  const savedPercent = saved / salary.monthly;
  const savedAngleSpan = savedPercent * (2 * Math.PI);
  const savedArcData = calculateArcData({
    spent: saved,
    total: saved,
    gap: gap,
    startAngle: startAngle,
    angleSpan: savedAngleSpan,
    radius: radius,
    center: center,
  });

  return (
    <Svg width={size} height={size}>
      <G>
        <G key={"needs"}>
          <Path
            d={needsArcData.bgArcPath}
            stroke={needsBgColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          {
            // TODO: if budget is 0 dont show
            needsArcData.spentPercent > 0 && (
              <Path
                d={needsArcData.fillArcPath}
                stroke={needsColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
              />
            )
          }
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

        <G key={"wants"}>
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

        <G key={"saved"}>
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
      </G>
    </Svg>
  );
}
