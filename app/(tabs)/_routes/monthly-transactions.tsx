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
  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <ThemedView style={styles.container}>
        <FlatList
          contentContainerStyle={styles.main}
          data={transactions}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadTransaction} />
          }
          renderItem={({ item }) => {
            const date = new Date(item.date);
            return (
              <ThemedView>
                <ThemedText>{item.name}</ThemedText>
                <ThemedText>{item.amount}</ThemedText>
                <ThemedText>{date.toDateString()}</ThemedText>
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

  main: {
    paddingVertical: 30,
    flex: 1,
    gap: 20,
  },
});
