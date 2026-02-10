import { ThemedView } from "@/components/themed-view";
import AnimatedScreen from "@/components/ui/animated-screen";
import CapsuleButton from "@/components/ui/capsule-button";
import SettingsModal from "@/components/ui/modal/settings-modal";
import TextButton from "@/components/ui/text-button";
import TransactionForm from "@/components/ui/transaction-form";
import { Colors } from "@/constants/theme";
import { useCategories } from "@/hooks/useCategories";
import { useCurrency } from "@/hooks/useCurrency";
import { useModal } from "@/hooks/useModal";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import DatabaseService from "@/services/DatabaseService";
import {
  RecurringTransaction,
  TransactionFormData,
  TransactionFormInitial,
} from "@/types";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import buildRRule from "@/utils/buildRRule";
import { formatMoney } from "@/utils/formatMoney";
import Octicons from "@expo/vector-icons/Octicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RRule, rrulestr, Weekday } from "rrule";
import { Toast } from "toastify-react-native";
import { ThemedText } from "../../../components/themed-text";

function EditRecurringTransaction({
  initialRecurring,
  onSave,
  onCancel,
}: {
  initialRecurring: RecurringTransaction;
  onSave: (name: RecurringTransaction) => Promise<void>;
  onCancel: () => void;
}) {
  const colorScheme = useColorScheme();
  const [formData, setFormData] = useState<TransactionFormData | null>(null);
  const rrule = rrulestr(initialRecurring.rrule);
  const frequency = rrule.options.freq;
  const interval = rrule.options.interval.toString() ?? "1";

  let weekday = RRule.MO;
  let monthDay = 1;
  let yearMonth = new Date(initialRecurring.date).getMonth() + 1;

  if (frequency === RRule.WEEKLY && rrule.options.byweekday?.length) {
    weekday = new Weekday(rrule.options.byweekday[0]);
  } else if (frequency === RRule.MONTHLY && rrule.options.bymonthday?.length) {
    monthDay = rrule.options.bymonthday[0];
  } else if (frequency === RRule.YEARLY) {
    monthDay = rrule.options.bymonthday?.[0] ?? monthDay;
    yearMonth = rrule.options.bymonth?.[0] ?? yearMonth;
  }

  const initialFormData: TransactionFormInitial = {
    name: initialRecurring.name,
    rawAmount: Math.round(initialRecurring.amount * 100).toString(),
    type: initialRecurring.type.toUpperCase() as "INCOME" | "EXPENSE",
    categoryId: initialRecurring.categoryId,
    date: new Date(initialRecurring.date),
    recurrence: {
      isRecurring: true,
      interval: interval,
      frequency: frequency,
      weekday: weekday,
      monthDay: monthDay,
      yearMonth: yearMonth,
    },
  };
  const saveRecurring = async () => {
    if (!formData) return;
    try {
      if (formData.isRecurring) {
        if (
          !formData.rawAmount ||
          !formData.name ||
          !formData.type ||
          !formData.categoryId
        ) {
          throw new Error("All fields are required");
        }
        if (!formData.interval || Number(formData.interval) < 1) {
          throw new Error("Interval must be at least 1");
        }

        const transaction = {
          name: formData.name.trim(),
          amount: parseFloat((Number(formData.rawAmount) / 100).toFixed(2)),
          type: formData.type.toLowerCase() as "income" | "expense",
          categoryId: formData.categoryId,
          date: formData.date.toISOString(),
        };

        const rrule = buildRRule(formData);

        // compute most recent recurrence date
        const lastDate = rrule.before(new Date(), true);

        if (lastDate) {
          transaction.date = lastDate.toISOString();
        }

        const updatedRecurring = {
          ...transaction,
          rrule: rrule.toString(),
          id: initialRecurring.id,
          lastGenerated: initialRecurring.lastGenerated,
        };
        return await onSave(updatedRecurring);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error ocurred saving transaction",
        });
      }
    }
  };

  const deleteRecurring = async () => {
    Alert.alert(
      "Delete Recurring Transaction",
      "Are you sure you want to delete this recurring transaction? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await DatabaseService.deleteRecurringTransaction(
                initialRecurring.id
              );
              onCancel();
            } catch (error: unknown) {
              if (error instanceof Error) {
                Toast.show({
                  type: "error",
                  text1: error.message,
                });
              } else {
                Toast.show({
                  type: "error",
                  text1: "An error ocurred deleting transaction",
                });
              }
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SettingsModal
      title="Edit Recurring Transaction"
      onComplete={saveRecurring}
      onCancel={onCancel}
    >
      <CapsuleButton
        text="DELETE TRANSACTION"
        bgFocused={Colors[colorScheme ?? "light"].error}
        onPress={deleteRecurring}
      />
      <TransactionForm initial={initialFormData} onChange={setFormData} />
    </SettingsModal>
  );
}

export default function ManageRecurringTransactions() {
  const { openModal, closeModal } = useModal();
  const {
    recurringTransactions,
    reload: reloadTransactions,
    loading: loadingTransactions,
  } = useRecurringTransactions();
  const colorScheme = useColorScheme();
  const bgColor = Colors[colorScheme ?? "light"].background;
  const {
    categories,
    reload: reloadCategories,
    loading: loadingCategories,
  } = useCategories();
  const {
    currency,
    loading: loadingCurrency,
    reload: reloadCurrency,
  } = useCurrency();

  useFocusEffect(
    useCallback(() => {
      reloadCategories();
      reloadTransactions();
      reloadCurrency();
    }, [reloadCategories, reloadTransactions, reloadCurrency])
  );

  const handleOpen = (recurring: RecurringTransaction) => {
    openModal(
      <EditRecurringTransaction
        initialRecurring={recurring}
        onCancel={() => {
          reloadTransactions();
          closeModal();
        }}
        onSave={async (newRecurring: RecurringTransaction) => {
          await DatabaseService.updateRecurringTransaction(newRecurring);
          reloadTransactions();
          closeModal();
        }}
      />
    );
  };

  if (loadingCategories || loadingCurrency || loadingTransactions) {
    return (
      <View
        style={{
          backgroundColor: Colors[colorScheme ?? "light"].background,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme ?? "light"].text}
        />
      </View>
    );
  }

  return (
    <AnimatedScreen entering="slideRight">
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.main}>
            <TextButton
              text="Back"
              iconName="arrow-left"
              IconComponent={Octicons}
              onPress={() => router.back()}
            />
            <ThemedText type="h1">
              Manage your recurring transactions
            </ThemedText>
            <FlatList
              contentContainerStyle={[
                styles.recurringList,
                {
                  backgroundColor: Colors[colorScheme ?? "light"].primary[200],
                },
              ]}
              data={recurringTransactions}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl
                  refreshing={loadingTransactions}
                  onRefresh={reloadTransactions}
                />
              }
              renderItem={({ item }) => {
                const rruleObj = rrulestr(item.rrule);
                const category = categories.find(
                  (cat) => cat.id === item.categoryId
                );
                return (
                  <ThemedView
                    key={item.id}
                    style={[
                      styles.recurringWrapper,
                      {
                        backgroundColor: adjustColorForScheme(
                          category
                            ? category.color
                            : Colors[colorScheme ?? "light"].primary[500],
                          colorScheme
                        ),
                      },
                    ]}
                  >
                    <View>
                      <ThemedText type="bodyLarge">{item.name}</ThemedText>
                      <ThemedText type="captionSmall">
                        {rruleObj.toText()}
                      </ThemedText>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <ThemedText type="h3">
                        {formatMoney({ amount: item.amount, code: currency })}
                      </ThemedText>
                      <Pressable
                        onPress={() => handleOpen(item)}
                        style={{ transform: [{ rotate: "90deg" }] }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Octicons
                          name="kebab-horizontal"
                          size={20}
                          color={Colors[colorScheme ?? "light"].text}
                        />
                      </Pressable>
                    </View>
                  </ThemedView>
                );
              }}
              ListEmptyComponent={
                <ThemedText>No recurring transactions found.</ThemedText>
              }
            />
          </ThemedView>
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

  main: {
    paddingVertical: 30,
    flex: 1,
    gap: 20,
  },

  recurringWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: "100%",
  },

  recurringList: {
    borderRadius: 20,
    gap: 20,
    padding: 16,
    alignItems: "center",
    flex: 1,
  },
});
