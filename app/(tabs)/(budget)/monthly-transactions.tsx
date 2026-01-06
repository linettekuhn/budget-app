import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AnimatedScreen from "@/components/ui/animated-screen";
import EditTransaction from "@/components/ui/edit-transaction";
import TextButton from "@/components/ui/text-button";
import TransactionItem from "@/components/ui/transaction-item";
import { Colors } from "@/constants/theme";
import { useCurrency } from "@/hooks/useCurrency";
import { useModal } from "@/hooks/useModal";
import DatabaseService from "@/services/DatabaseService";
import { TransactionType } from "@/types";
import Octicons from "@expo/vector-icons/Octicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

type SectionType = {
  title: string;
  data: TransactionType[];
};

export default function MonthlyTransactions() {
  const colorScheme = useColorScheme();

  const bgColor = Colors[colorScheme ?? "light"].background;

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<SectionType[]>([]);
  const { openModal, closeModal } = useModal();
  const { currency, loading: loadingCurrency } = useCurrency();

  const loadTransaction = async () => {
    try {
      const data = await DatabaseService.getAllTransactions();
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

      // group transactions by month
      const grouped: Record<string, TransactionType[]> = {};
      savedTransactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(transaction);
      });

      // sort keys descending (selected month first)
      const orderedKeys = Object.keys(grouped).sort().reverse();

      // build sections for each month
      const sections: SectionType[] = orderedKeys.map((key) => {
        const [year, month] = key.split("-");
        const monthName = new Date(
          parseInt(year),
          parseInt(month) - 1
        ).toLocaleString("en-US", { month: "long", year: "numeric" });
        return { title: monthName, data: grouped[key] };
      });

      setSections(sections);
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

  if (loading || loadingCurrency) {
    return <ActivityIndicator size="large" />;
  }

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
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadTransaction}
              />
            }
            renderItem={({ item }) => (
              <TransactionItem
                currency={currency ?? "USD"}
                transaction={item}
                handleEdit={handleEditTransaction}
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.monthHeader}>
                <ThemedText type="overline">{title}</ThemedText>
              </View>
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

  monthHeader: { marginTop: 16, marginBottom: 4 },
});
