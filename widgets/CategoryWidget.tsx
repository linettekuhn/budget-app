import { Colors } from "@/constants/theme";
import { Rectangle, Text, VStack, ZStack } from "@expo/ui/swift-ui";
import {
  containerRelativeFrame,
  font,
  foregroundStyle,
  multilineTextAlignment,
  opacity,
  padding,
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

type CategoryWidgetProps = {
  noCategorySet: boolean;
  categoryName: string;
  categoryColor: string;
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
  widgetUrl: string;
};

const CategoryWidget = (props: CategoryWidgetProps, env: WidgetEnvironment) => {
  "widget";

  const scheme = env.colorScheme === "dark" ? "dark" : "light";
  const c = (props.colors ?? Colors)[scheme];
  const isAccented = (env.widgetRenderingMode ?? "fullColor") !== "fullColor";

  const isSmall = env.widgetFamily === "systemSmall";
  const isOverBudget = props.isOverBudget ?? false;
  const noBudgetSet = props.noBudgetSet ?? false;
  const noCategorySet = props.noCategorySet ?? true;
  const daysLeft = props.daysLeft ?? 0;
  const monthName = props.monthName ?? "";
  const url = props.widgetUrl ?? "budgetapp:///(tabs)/(budget)";

  const remainingColor = isAccented
    ? "#FFFFFF"
    : isOverBudget
      ? c.error
      : c.text;
  const mutedColor = isAccented ? "#FFFFFF" : c.primary[700];
  const dimmedColor = isAccented ? "#FFFFFF" : c.primary[500];
  const accentColor = isAccented
    ? "#FFFFFF"
    : props.categoryColor || c.primary[500];

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

  const categoryLabel = props.categoryName
    ? props.categoryName
        .split(" ")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ") + " Budget Left"
    : "Category Budget";

  const gradientRect = isAccented ? (
    <Rectangle
      modifiers={[
        foregroundStyle({ type: "color", color: "#FFFFFF" }),
        opacity(0.15),
      ]}
    />
  ) : (
    <Rectangle
      modifiers={[
        foregroundStyle({
          type: "linearGradient",
          colors: [c.background, c.primary[200]],
          startPoint: { x: 0.5, y: 0.5 },
          endPoint: { x: 1, y: 1 },
        }),
      ]}
    />
  );

  const zstackModifiers = [
    containerRelativeFrame({ axes: "both", span: 1, count: 1 }),
    widgetURL(url),
  ];

  return noCategorySet ? (
    <ZStack modifiers={zstackModifiers}>
      {gradientRect}
      <VStack modifiers={[padding({ all: 16 })]}>
        <Text
          modifiers={[
            font({ size: 10, weight: "semibold" }),
            foregroundStyle(mutedColor),
          ]}
        >
          CATEGORY BUDGET
        </Text>
        <Text
          modifiers={[
            font({ size: 14, weight: "semibold" }),
            foregroundStyle(isAccented ? "#FFFFFF" : c.text),
          ]}
        >
          No category set
        </Text>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(dimmedColor)]}>
          Choose one in app settings
        </Text>
      </VStack>
    </ZStack>
  ) : noBudgetSet ? (
    <ZStack modifiers={zstackModifiers}>
      {gradientRect}
      <VStack modifiers={[padding({ all: 16 })]}>
        <Text
          modifiers={[
            font({ size: 10, weight: "semibold" }),
            foregroundStyle(accentColor),
          ]}
        >
          {categoryLabel.toUpperCase()}
        </Text>
        <Text
          modifiers={[
            font({ size: 14, weight: "semibold" }),
            foregroundStyle(isAccented ? "#FFFFFF" : c.text),
          ]}
        >
          No budget set
        </Text>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(dimmedColor)]}>
          Open the app to get started
        </Text>
      </VStack>
    </ZStack>
  ) : (
    <ZStack modifiers={zstackModifiers}>
      {gradientRect}
      <VStack modifiers={[padding({ all: 8 })]}>
        <Text
          modifiers={[
            font({ size: 10, weight: "semibold" }),
            foregroundStyle(accentColor),
            multilineTextAlignment("center"),
          ]}
        >
          {categoryLabel.toUpperCase()}
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
    </ZStack>
  );
};

export default createWidget("CategoryWidget", CategoryWidget);
