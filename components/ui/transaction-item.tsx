import { Colors, getTheme } from "@/constants/theme";
import { TransactionType } from "@/types";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import Octicons from "@expo/vector-icons/Octicons";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";
import MoneyText from "./money-text";

export default function TransactionItem({
  currency,
  transaction,
  handleEdit,
}: {
  currency: string;
  transaction: TransactionType;
  handleEdit: (transaction: TransactionType) => void;
}) {
  const colorScheme = useColorScheme();
  const date = new Date(transaction.date);
  const transactionBgColor = Colors[getTheme(colorScheme)].primary[700];
  const bgColor = Colors[getTheme(colorScheme)].background;
  const typeColor =
    transaction.type === "income"
      ? adjustColorForScheme("#2EA64E", colorScheme)
      : adjustColorForScheme("#CF3D3D", colorScheme);

  return (
    <ThemedView
      key={transaction.id}
      style={[
        styles.transactionWrapper,
        { backgroundColor: transactionBgColor },
      ]}
    >
      <ThemedView
        style={{
          backgroundColor: transactionBgColor,
          flexGrow: 1,
        }}
      >
        <ThemedText
          style={{
            color: bgColor,
            margin: 0,
            lineHeight: 0,
          }}
          numberOfLines={1}
        >
          {transaction.name}
        </ThemedText>
        <ThemedText
          type="captionSmall"
          style={{
            color: bgColor,
            margin: 0,
            lineHeight: 0,
          }}
        >
          {date.toLocaleDateString()}
        </ThemedText>
      </ThemedView>
      <MoneyText
        variant="block"
        amount={Number(transaction.amount.toFixed(2))}
        currency={currency}
        type="h4"
        align="right"
        decimals
        darkColor={typeColor}
        lightColor={typeColor}
      />
      <Pressable
        onPress={() => handleEdit(transaction)}
        style={{ transform: [{ rotate: "90deg" }] }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Octicons name="kebab-horizontal" size={20} color={bgColor} />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  transactionWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 12,
    width: "100%",
    alignSelf: "stretch",
    gap: 12,
    overflow: "hidden",
  },
});
