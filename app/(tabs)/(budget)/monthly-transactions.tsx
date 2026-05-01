import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AnimatedScreen from "@/components/ui/animated-screen";
import EditTransaction from "@/components/ui/edit-transaction";
import MoneyText from "@/components/ui/money-text";
import TextButton from "@/components/ui/text-button";
import TransactionItem from "@/components/ui/transaction-item";
import { Colors, getTheme } from "@/constants/theme";
import { useCurrency } from "@/hooks/useCurrency";
import { useModal } from "@/hooks/useModal";
import { useTabBarPadding } from "@/hooks/useTabBarPadding";
import DatabaseService from "@/services/DatabaseService";
import WidgetService from "@/services/WidgetService";
import { TransactionType } from "@/types";
import { getTotalIncomeForMonth } from "@/utils/incomeUtils";
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
  spent: number;
  income: number;
  net: number;
  data: TransactionType[];
};

type MonthHeaderProps = {
  title: string;
  spent: number;
  income: number;
  net: number;
  currency: string | undefined;
  inColor: string;
  outColor: string;
  background: string;
  pillBackground: string;
};

function MonthHeader({
  title,
  spent,
  net,
  income,
  currency,
  inColor,
  outColor,
  background,
  pillBackground,
}: MonthHeaderProps) {
  return (
    <View style={[styles.monthHeader, { backgroundColor: background }]}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <View
          style={{
            alignSelf: "flex-start",
            paddingVertical: 4,
            paddingHorizontal: 16,
            backgroundColor: pillBackground,
            borderRadius: 100,
          }}
        >
          <ThemedText type="overline" style={{ fontFamily: "Onest-Bold" }}>
            {title}
          </ThemedText>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            flex: 1,
          }}
        >
          <ThemedText
            type="caption"
            style={[
              styles.label,
              {
                fontFamily: "Onest-SemiBold",
                color: net > 0 ? inColor : outColor,
              },
            ]}
          >
            Net: {net > 0 ? "+" : "-"}
          </ThemedText>
          <MoneyText
            align="left"
            variant="block"
            type="caption"
            amount={net}
            currency={currency ?? "USD"}
            decimals
            style={{
              fontFamily: "Onest-SemiBold",
              color: net > 0 ? inColor : outColor,
            }}
          />
        </View>
      </View>
      <View style={styles.summaryRow}>
        <View style={[styles.summaryItem, { justifyContent: "flex-start" }]}>
          <ThemedText type="caption" style={styles.label}>
            Income:
          </ThemedText>
          <MoneyText
            variant="block"
            type="caption"
            amount={income}
            currency={currency ?? "USD"}
            decimals
          />
        </View>

        <View style={[styles.summaryItem, { justifyContent: "flex-end" }]}>
          <ThemedText type="caption" style={styles.label}>
            Spent:
          </ThemedText>
          <MoneyText
            variant="block"
            type="caption"
            amount={spent}
            currency={currency ?? "USD"}
            decimals
          />
        </View>
      </View>
    </View>
  );
}

export default function MonthlyTransactions() {
  const colorScheme = useColorScheme();

  const bgColor = Colors[getTheme(colorScheme)].background;

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<SectionType[]>([]);
  const { openModal, closeModal } = useModal();
  const { currency, loading: loadingCurrency } = useCurrency();
  const tabBarPadding = useTabBarPadding();

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
          date.getMonth() + 1,
        ).padStart(2, "0")}`;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(transaction);
      });

      // sort keys descending (selected month first)
      const orderedKeys = Object.keys(grouped).sort().reverse();

      const incomeSources = await DatabaseService.getActiveIncomeSources();

      // build sections for each month
      const sections: SectionType[] = orderedKeys.map((key) => {
        const [yearStr, monthStr] = key.split("-");
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);

        const monthName = new Date(year, month - 1).toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        });

        const transactions = grouped[key];

        let spent = 0;
        let income = 0;

        transactions.forEach((transaction) => {
          if (transaction.type === "expense") {
            spent += transaction.amount;
          } else if (transaction.type === "income") {
            income += transaction.amount;
          }
        });

        const recurringIncome = getTotalIncomeForMonth(
          incomeSources,
          year,
          month,
        );

        income += recurringIncome;

        const net = income - spent;

        return {
          title: monthName,
          spent: spent,
          income: income,
          net: net,
          data: grouped[key],
        };
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
          await WidgetService.syncAll();
          loadTransaction();
          closeModal();
        }}
      />,
    );
  };

  useEffect(() => {
    loadTransaction();
  }, []);

  if (loading || loadingCurrency) {
    return (
      <View
        style={{
          backgroundColor: bgColor,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator
          size="large"
          color={Colors[getTheme(colorScheme)].text}
        />
      </View>
    );
  }

  return (
    <AnimatedScreen>
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: bgColor, paddingBottom: tabBarPadding },
        ]}
      >
        <ThemedView style={styles.container}>
          <TextButton
            text="Back"
            iconName="arrow-left"
            IconComponent={Octicons}
            onPress={() => router.back()}
          />
          <ThemedText
            type="displayMedium"
            style={{ marginVertical: 16, textAlign: "left" }}
          >
            Transactions
          </ThemedText>
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
            renderSectionHeader={({
              section: { title, spent, income, net },
            }) => (
              <MonthHeader
                title={title}
                spent={spent}
                income={income}
                net={net}
                currency={currency}
                inColor={Colors[getTheme(colorScheme)].income[600]}
                outColor={Colors[getTheme(colorScheme)].expense[600]}
                background={Colors[getTheme(colorScheme)].primary[200]}
                pillBackground={Colors[getTheme(colorScheme)].primary[300]}
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

  monthHeader: {
    marginBottom: 4,
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 8,
  },

  summaryItem: {
    opacity: 0.5,
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 4,
  },

  label: {
    flexShrink: 0,
  },
});
