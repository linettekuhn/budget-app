import { Colors } from "@/constants/theme";
import { Text, VStack } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  multilineTextAlignment,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

type BudgetWidgetProps = {
  remainingFormatted: string;
  totalBudgetFormatted: string;
  dailyRemainingFormatted: string;
  isOverBudget: boolean;
  noBudgetSet: boolean;
  daysLeft: number;
  monthName: string;
  colors: typeof Colors;
  heroFontSizeSmall: number;
  heroFontSizeLarge: number;
};

const BudgetWidget = (props: BudgetWidgetProps, env: WidgetEnvironment) => {
  "widget";

  const scheme = env.colorScheme === "dark" ? "dark" : "light";
  const c = (props.colors ?? Colors)[scheme];

  const isSmall = env.widgetFamily === "systemSmall";
  const isOverBudget = props.isOverBudget ?? false;
  const noBudgetSet = props.noBudgetSet ?? false;
  const daysLeft = props.daysLeft ?? 0;
  const monthName = props.monthName ?? "";

  const remainingColor = isOverBudget ? c.error : c.text;
  const mutedColor = c.primary[700];
  const dimmedColor = c.primary[500];

  const heroFontSize = isSmall
    ? (props.heroFontSizeSmall ?? 20)
    : (props.heroFontSizeLarge ?? 34);

  const daysLabel =
    daysLeft === 0
      ? "Last day of " + monthName
      : daysLeft === 1
        ? "1 day left in " + monthName
        : `${daysLeft} days left in ${monthName}`;

  const showDaily =
    !isSmall &&
    !isOverBudget &&
    daysLeft > 0 &&
    props.dailyRemainingFormatted !== "";

  return noBudgetSet ? (
    <VStack modifiers={[padding({ all: 16 })]}>
      <Text
        modifiers={[
          font({ size: 10, weight: "semibold" }),
          foregroundStyle(mutedColor),
        ]}
      >
        BUDGET LEFT
      </Text>
      <Text
        modifiers={[
          font({ size: 14, weight: "semibold" }),
          foregroundStyle(c.text),
        ]}
      >
        No budget set
      </Text>
      <Text modifiers={[font({ size: 11 }), foregroundStyle(dimmedColor)]}>
        Open the app to get started
      </Text>
    </VStack>
  ) : (
    <VStack modifiers={[padding({ all: 8 })]}>
      <Text
        modifiers={[
          font({ size: 10, weight: "semibold" }),
          foregroundStyle(mutedColor),
        ]}
      >
        BUDGET LEFT
      </Text>
      <Text
        modifiers={[
          font({ size: heroFontSize, weight: "bold" }),
          foregroundStyle(remainingColor),
        ]}
      >
        {isOverBudget ? "-" : ""}
        {props.remainingFormatted}
      </Text>
      <Text
        modifiers={[
          font({ size: 12 }),
          foregroundStyle(dimmedColor),
          multilineTextAlignment("center"),
        ]}
      >
        of {props.totalBudgetFormatted} total
      </Text>
      <Text modifiers={[font({ size: 11 }), foregroundStyle(mutedColor)]}>
        {daysLabel}
      </Text>
      {showDaily && (
        <Text
          modifiers={[
            font({ size: 11, weight: "medium" }),
            foregroundStyle(mutedColor),
            multilineTextAlignment("center"),
          ]}
        >
          {props.dailyRemainingFormatted}/day
        </Text>
      )}
    </VStack>
  );
};

export default createWidget("BudgetWidget", BudgetWidget);
