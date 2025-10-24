import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { TransactionType } from "@/types";
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

export default function MonthlyTransactions() {
  const db = useSQLiteContext();
  const colorScheme = useColorScheme();
  const bgLight = Colors[colorScheme ?? "light"].backgroundLight;
  const bgColor = Colors[colorScheme ?? "light"].background;

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);

  const loadTransaction = async () => {
    try {
      const data = await db.getAllAsync<TransactionType>(
        "SELECT id, name, amount, type, categoryId, date FROM transactions ORDER BY date DESC"
      );
      const savedTransactions = data.map((row) => {
        const transaction: TransactionType = {
          id: row.id,
          name: row.name,
          amount: row.amount,
          type: row.type,
          categoryId: row.categoryId,
          date: row.date,
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
  // TODO: show all months with headers for each month
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <ThemedView style={styles.container}>
        <ThemedText type="displayMedium" style={styles.header}>
          {new Date().toLocaleDateString("en-US", { month: "long" })}{" "}
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
                  { backgroundColor: bgLight },
                ]}
              >
                <ThemedView style={{ backgroundColor: bgLight }}>
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
    fontFamily: "BricolageGrotesque-SemiBold",
  },
});
