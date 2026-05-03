import { Colors } from "@/constants/theme";
import { TransactionType } from "@/types";
import { HStack, Text, VStack } from "@expo/ui/swift-ui";
import {
  background,
  clipShape,
  font,
  foregroundStyle,
  multilineTextAlignment,
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

  const transaction = props.lastTransaction ?? undefined;

  const mutedColor = c.primary[700];
  const dimmedColor = c.primary[400];
  const accentColor = c.primary[500];

  const url = props.widgetUrl ?? "budgetapp:///(tabs)/transaction?type=EXPENSE";

  if (!transaction) {
    return (
      <VStack modifiers={[padding({ all: 16 }), widgetURL(url)]}>
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
            foregroundStyle(c.text),
          ]}
        >
          No transactions yet
        </Text>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(dimmedColor)]}>
          Tap to add your first
        </Text>
      </VStack>
    );
  }

  const typeColor =
    transaction.type === "income" ? c.income[500] : c.expense[500];
  const typeLabel = transaction.type === "income" ? "↑" : "↓";

  const pillBackground =
    scheme === "dark" ? props.pillBackgroundDark : props.pillBackgroundLight;

  return (
    <VStack spacing={12} modifiers={[widgetURL(url)]}>
      <Text
        modifiers={[
          font({ size: 10, weight: "semibold" }),
          foregroundStyle(c.text),
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
  );
};

export default createWidget("AddTransactionWidget", AddTransactionWidget);
