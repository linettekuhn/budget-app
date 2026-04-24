import { Text, VStack } from "@expo/ui/swift-ui";
import { font, foregroundStyle, padding } from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

type BudgetWidgetProps = {
  remaining: number;
  percentUsed: number;
  totalBudget: number;
  daysLeft: number;
};

const BudgetWidget = (props: BudgetWidgetProps, env: WidgetEnvironment) => {
  "widget";

  const isSmall = env.widgetFamily === "systemSmall";

  // Use a fallback for the first render before the app syncs
  const remaining = props.remaining ?? 0;
  const percentUsed = props.percentUsed ?? 0;

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
      <Text modifiers={[font({ size: isSmall ? 26 : 32, weight: "bold" })]}>
        ${remaining.toFixed(0)}
      </Text>
      <Text modifiers={[font({ size: 12 }), foregroundStyle("#666666")]}>
        {percentUsed}% used
      </Text>
    </VStack>
  );
};

export default createWidget("BudgetWidget", BudgetWidget);
