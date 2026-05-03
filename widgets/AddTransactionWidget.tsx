import { Colors } from "@/constants/theme";
import { TransactionType } from "@/types";
import { HStack, Rectangle, Text, VStack, ZStack } from "@expo/ui/swift-ui";
import {
  background,
  clipShape,
  containerRelativeFrame,
  font,
  foregroundStyle,
  multilineTextAlignment,
  opacity,
  padding,
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, WidgetEnvironment } from "expo-widgets";

type AddTransactionWidgetProps = {
  lastTransaction: TransactionType | undefined;
  transactionName: string;
  formattedAmount: string;
  heroFontSize: number;
  categoryColor?: string;
  pillBackgroundLight: string;
  pillBackgroundDark: string;
  widgetUrl: string;
  colors: typeof Colors;
};

const AddTransactionWidget = (
  props: AddTransactionWidgetProps,
  env: WidgetEnvironment,
) => {
  "widget";
  const scheme = env.colorScheme === "dark" ? "dark" : "light";
  const c = (props.colors ?? Colors)[scheme];
  const isAccented = (env.widgetRenderingMode ?? "fullColor") !== "fullColor";

  const transaction = props.lastTransaction ?? undefined;

  const mutedColor = isAccented ? "#FFFFFF" : c.primary[700];
  const dimmedColor = isAccented ? "#FFFFFF" : c.primary[400];
  const accentColor = isAccented ? "#FFFFFF" : c.primary[500];

  const url = props.widgetUrl ?? "budgetapp:///(tabs)/transaction?type=EXPENSE";

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

  if (!transaction) {
    return (
      <ZStack
        modifiers={[
          containerRelativeFrame({ axes: "both", span: 1, count: 1 }),
          widgetURL(url),
        ]}
      >
        {gradientRect}
        <VStack modifiers={[padding({ all: 16 })]}>
          <Text
            modifiers={[
              font({ size: 10, weight: "semibold" }),
              foregroundStyle(mutedColor),
            ]}
          >
            LAST TRANSACTION
          </Text>
          <Text
            modifiers={[
              font({ size: 14, weight: "semibold" }),
              foregroundStyle(isAccented ? "#FFFFFF" : c.text),
            ]}
          >
            No transactions yet
          </Text>
          <Text modifiers={[font({ size: 11 }), foregroundStyle(dimmedColor)]}>
            Tap to add your first
          </Text>
        </VStack>
      </ZStack>
    );
  }

  const typeColor = isAccented
    ? "#FFFFFF"
    : transaction.type === "income"
      ? c.income[500]
      : c.expense[500];
  const typeLabel = transaction.type === "income" ? "↑" : "↓";

  const pillBackground = isAccented
    ? "#FFFFFF33"
    : scheme === "dark"
      ? props.pillBackgroundDark
      : props.pillBackgroundLight;

  return (
    <ZStack
      modifiers={[
        containerRelativeFrame({ axes: "both", span: 1, count: 1 }),
        widgetURL(url),
      ]}
    >
      {gradientRect}
      <VStack spacing={12} modifiers={[padding({ all: 16 })]}>
        <Text
          modifiers={[
            font({ size: 10, weight: "semibold" }),
            foregroundStyle(isAccented ? "#FFFFFF" : c.text),
          ]}
        >
          LAST TRANSACTION
        </Text>
        <VStack spacing={2}>
          <Text
            modifiers={[
              font({ size: props.heroFontSize, weight: "bold" }),
              foregroundStyle(typeColor),
            ]}
          >
            {typeLabel} {props.formattedAmount}
          </Text>
          <Text
            modifiers={[
              font({ size: 12 }),
              foregroundStyle(accentColor),
              multilineTextAlignment("leading"),
            ]}
          >
            {props.transactionName}
          </Text>
        </VStack>
        <HStack
          modifiers={[
            padding({ horizontal: 8, vertical: 4 }),
            background(pillBackground),
            clipShape("capsule"),
          ]}
        >
          <Text
            modifiers={[
              font({ size: 11, weight: "medium" }),
              foregroundStyle(mutedColor),
            ]}
          >
            + Add New
          </Text>
        </HStack>
      </VStack>
    </ZStack>
  );
};

export default createWidget("AddTransactionWidget", AddTransactionWidget);
