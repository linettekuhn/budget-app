import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AnimatedScreen from "@/components/ui/animated-screen";
import EditTransaction from "@/components/ui/edit-transaction";
import TextButton from "@/components/ui/text-button";
import TransactionItem from "@/components/ui/transaction-item";
import { Colors } from "@/constants/theme";
import { useModal } from "@/hooks/useModal";
import DatabaseService from "@/services/DatabaseService";
import { TransactionType } from "@/types";
import Octicons from "@expo/vector-icons/Octicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function MonthlyTransactions() {
  const params = useLocalSearchParams();
  const date: Date = new Date(JSON.parse(params.date as string));
  const colorScheme = useColorScheme();
  const transactinBgColor = Colors[colorScheme ?? "light"].primary[700];
  const bgColor = Colors[colorScheme ?? "light"].background;

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const { openModal, closeModal } = useModal();

  const loadTransaction = async () => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const data = await DatabaseService.getTransactionsByMonth(year, month);
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
        Toast.show({
          type: "error",
          text1: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error ocurred loading transactions",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditTransaction = (transaction: TransactionType) => {
    openModal(
      <EditTransaction
        initialTransaction={transaction}
        onCancel={() => {
          loadTransaction();
          closeModal();
        }}
        onSave={async (newTransaction: TransactionType) => {
          await DatabaseService.updateTransaction(newTransaction);
          loadTransaction();
          closeModal();
        }}
      />
    );
  };

  useEffect(() => {
    loadTransaction();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }
  // TODO: show all months with headers for each month
  return (
    <AnimatedScreen>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <ThemedView style={styles.container}>
          <TextButton
            text="Back"
            iconName="arrow-left"
            IconComponent={Octicons}
            onPress={() => router.back()}
          />
          <ThemedText type="displayMedium" style={styles.header}>
            {new Date().toLocaleDateString("en-US", { month: "long" })}{" "}
            Transactions
          </ThemedText>
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadTransaction}
              />
            }
            renderItem={({ item }) => (
              <TransactionItem
                transaction={item}
                handleEdit={handleEditTransaction}
              />
            )}
            ListEmptyComponent={<ThemedText>No transactions found</ThemedText>}
          />
        </ThemedView>
      </SafeAreaView>
    </AnimatedScreen>
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
