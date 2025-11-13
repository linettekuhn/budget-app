import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { CategoryType, TransactionType } from "@/types";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoryTransactions() {
  const params = useLocalSearchParams();
  const category: CategoryType = JSON.parse(params.category as string);

  const db = useSQLiteContext();
  const colorScheme = useColorScheme();
  const transactionBgColor = Colors[colorScheme ?? "light"].primary[700];
  const bgColor = Colors[colorScheme ?? "light"].background;

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);

  const loadTransaction = async () => {
    try {
      const data = await db.getAllAsync<TransactionType>(
        `
        SELECT
            t.id,
            t.name,
            t.amount,
            t.type,
            t.categoryId,
            t.date,
            c.name AS categoryName,
            c.color AS categoryColor
        FROM transactions t
        INNER JOIN categories c ON t.categoryId = c.id
        WHERE t.categoryId = ?
        ORDER BY t.date DESC
    `,
        [category.id]
      );
      const savedTransactions = data.map((row) => {
        const transaction: TransactionType = {
          id: row.id,
          name: row.name,
          amount: row.amount,
          type: row.type,
          categoryId: row.categoryId,
          date: row.date,
          categoryColor: row.categoryColor,
          categoryName: row.categoryName,
        };
        return transaction;
      });
      setTransactions(savedTransactions);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("An error ocurred loading transactions");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransaction();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <ThemedView style={styles.container}>
        <ThemedText type="displayMedium" style={styles.header}>
          {category.name
            .split(" ")
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(" ")}{" "}
          Transactions
        </ThemedText>
        <FlatList
          data={transactions}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadTransaction} />
          }
          renderItem={({ item }) => {
            const date = new Date(item.date);
            const typeColor = item.type === "income" ? "#2EA64E" : "#CF3D3D";
            return (
              <ThemedView
                style={[
                  styles.transactionWrapper,
                  { backgroundColor: transactionBgColor },
                ]}
              >
                <ThemedView style={{ backgroundColor: transactionBgColor }}>
                  <ThemedText style={{ color: bgColor }}>
                    {item.name}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: bgColor }}>
                    {date.toLocaleDateString()}
                  </ThemedText>
                </ThemedView>
                <ThemedText
                  style={[styles.transactionAmount, { color: typeColor }]}
                  type="bodyLarge"
                >{`$${item.amount.toFixed(2)}`}</ThemedText>
              </ThemedView>
            );
          }}
          ListEmptyComponent={<ThemedText>No transactions found</ThemedText>}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  header: {
    marginBottom: 20,
  },

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

  transactionAmount: {
    fontFamily: "Onest-SemiBold",
  },
});
