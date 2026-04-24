import { Text, VStack } from "@expo/ui/swift-ui";
import { font, foregroundStyle, padding } from "@expo/ui/swift-ui/modifiers";
import { createWidget, WidgetBase } from "expo-widgets";

type BudgetWidgetProps = {
  remaining: number;
  totalBudget: number;
  totalSpent: number;
  percentUsed: number;
  daysLeft: number;
  currency: string;
};

function getColor(percentUsed: number): string {
  if (percentUsed < 60) return "#22c55e";
  if (percentUsed < 85) return "#f59e0b";
  return "#ef4444";
}

const BudgetWidget = (p: WidgetBase<BudgetWidgetProps>) => {
  "widget";

  const color = getColor(p.percentUsed);
  const isSmall = p.widgetFamily === "systemSmall";

  return (
    <VStack modifiers={[padding({ all: 14 })]}>
      <Text
        modifiers={[
          font({ size: 10, weight: "semibold" }),
          foregroundStyle("#888888"),
        ]}
      >
        BUDGET LEFT
      </Text>
      <Text
        modifiers={[
          font({ size: isSmall ? 26 : 32, weight: "bold" }),
          foregroundStyle(color),
        ]}
      >
        ${p.remaining.toFixed(0)}
      </Text>
      <Text modifiers={[font({ size: 12 }), foregroundStyle("#666666")]}>
        {p.percentUsed}% of ${p.totalBudget.toFixed(0)} used
      </Text>
      {!isSmall && (
        <Text
          modifiers={[
            font({ size: 11, weight: "semibold" }),
            foregroundStyle(color),
          ]}
        >
          ${(p.remaining / Math.max(p.daysLeft, 1)).toFixed(2)}/day left
        </Text>
      )}
    </VStack>
  );
};

export default createWidget("BudgetWidget", BudgetWidget);
