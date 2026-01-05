import { Colors } from "@/constants/theme";
import { TransactionType } from "@/types";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import Octicons from "@expo/vector-icons/Octicons";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

export default function TransactionItem({
  transaction,
  handleEdit,
}: {
  transaction: TransactionType;
  handleEdit: (transaction: TransactionType) => void;
}) {
  const colorScheme = useColorScheme();
  const date = new Date(transaction.date);
  const transactionBgColor = Colors[colorScheme ?? "light"].primary[700];
  const bgColor = Colors[colorScheme ?? "light"].background;
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
        }}
      >
        <ThemedText
          style={{
            color: bgColor,
            margin: 0,
            lineHeight: 0,
          }}
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
      <View style={{ flexDirection: "row", gap: 4 }}>
        <ThemedText style={{ color: typeColor }} type="h6">
          ${transaction.amount.toFixed(2)}
        </ThemedText>
        <Pressable
          onPress={() => handleEdit(transaction)}
          style={{ transform: [{ rotate: "90deg" }] }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Octicons name="kebab-horizontal" size={20} color={bgColor} />
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  transactionWrapper: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 25,
    marginVertical: 10,
  },
});
