import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CapsuleButton from "@/components/ui/capsule-button";
import EditCategory from "@/components/ui/modal/edit-category-modal";
import { Colors } from "@/constants/theme";
import { useCategorySpend } from "@/hooks/useCategorySpend";
import { useModal } from "@/hooks/useModal";
import DatabaseService from "@/services/DatabaseService";
import { CategoryType, TransactionType } from "@/types";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function CategoryTransactions() {
  const params = useLocalSearchParams();
  const category: CategoryType = JSON.parse(params.category as string);
  const date: Date = new Date(JSON.parse(params.date as string));

  const colorScheme = useColorScheme();
  const transactionBgColor = Colors[colorScheme ?? "light"].primary[700];
  const bgColor = Colors[colorScheme ?? "light"].background;

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const {
    budget,
    loading: loadingBudget,
    reload: reloadSpend,
  } = useCategorySpend(category.id);
  const { openModal, closeModal } = useModal();

  useFocusEffect(
    useCallback(() => {
      reloadSpend();
    }, [reloadSpend])
  );

  const handleOpen = () => {
    openModal(
      <EditCategory
        onComplete={() => {
          closeModal();
          reloadSpend();
        }}
        category={category}
      />
    );
  };

  const loadTransaction = async () => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const transactionsData = await DatabaseService.getCategoryTransactions(
        category.id,
        year,
        month
      );
      const savedTransactions = transactionsData.map((row) => {
        const transaction: TransactionType = {
          id: row.id,
          uuid: row.uuid,
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

  useEffect(() => {
    loadTransaction();
  }, []);

  if (loading || loadingBudget || !budget) {
    return <ActivityIndicator size="large" />;
  }
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.main}>
          <View>
            <ThemedText type="displayMedium" style={styles.header}>
              {category.name
                .split(" ")
                .map((word) => word[0].toUpperCase() + word.slice(1))
                .join(" ")}{" "}
              Transactions
            </ThemedText>
            <ThemedText
              type="bodyLarge"
              style={{ textAlign: "center", paddingHorizontal: 32 }}
            >
              You have spent ${budget.totalSpent} out of your ${budget.budget}{" "}
              budget for{" "}
              {category.name
                .split(" ")
                .map((word) => word[0].toLowerCase() + word.slice(1))
                .join(" ")}
              .
            </ThemedText>
          </View>
          <CapsuleButton
            text="Edit Budget"
            onPress={handleOpen}
            bgFocused={Colors[colorScheme ?? "light"].primary[500]}
          />
          <FlatList
            contentContainerStyle={[
              styles.transactionList,
              { backgroundColor: Colors[colorScheme ?? "light"].primary[200] },
            ]}
            data={transactions}
            keyExtractor={(item) => String(item.id)}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadTransaction}
              />
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
                      {item.name}
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
                  <ThemedText
                    style={{ color: typeColor }}
                    type="bodyLarge"
                  >{`$${item.amount.toFixed(2)}`}</ThemedText>
                </ThemedView>
              );
            }}
            ListEmptyComponent={<ThemedText>No transactions found</ThemedText>}
          />
        </ThemedView>
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
    flex: 1,
    gap: 30,
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

  transactionList: {
    borderRadius: 20,
    gap: 20,
    padding: 16,
    alignItems: "center",
    flex: 1,
  },
});
