import { ThemedView } from "@/components/themed-view";
import SettingsModal from "@/components/ui/modal/settings-modal";
import { Colors } from "@/constants/theme";
import { useCategories } from "@/hooks/useCategories";
import { useModal } from "@/hooks/useModal";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { RecurringTransaction } from "@/types";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import { formatAmountDisplay } from "@/utils/formatDisplay";
import Octicons from "@expo/vector-icons/Octicons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { rrulestr } from "rrule";
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
  // TODO: state for each recurring transaction edit option
  // TODO: steal from transactions
  const [recurring, setRecurring] = useState(initialRecurring);

  const saveRecurring = () => {};
  return (
    <SettingsModal
      title="Edit Recurring Transaction"
      onComplete={saveRecurring}
      onCancel={onCancel}
    ></SettingsModal>
  );
}

export default function ManageRecurringTransactions() {
  const { openModal, closeModal } = useModal();
  const { recurringTransactions } = useRecurringTransactions();
  const colorScheme = useColorScheme();
  const bgColor = Colors[colorScheme ?? "light"].background;
  const { categories } = useCategories();

  const handleOpen = (recurring: RecurringTransaction) => {
    openModal(
      <EditRecurringTransaction
        initialRecurring={recurring}
        onCancel={closeModal}
        onSave={async (newRecurring: RecurringTransaction) => {
          //await DatabaseService.updateRecurring(newRecurring);
          closeModal();
        }}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.main}>
          {recurringTransactions.map((recurring) => {
            const rruleObj = rrulestr(recurring.rrule);
            const category = categories.find(
              (cat) => cat.id === recurring.categoryId
            );
            return (
              <ThemedView
                key={recurring.id}
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
                  <ThemedText type="bodyLarge">{recurring.name}</ThemedText>
                  <ThemedText type="captionSmall">
                    {rruleObj.toText()}
                  </ThemedText>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <ThemedText type="h3">
                    ${formatAmountDisplay(recurring.amount.toFixed(2))}
                  </ThemedText>
                  <Pressable
                    onPress={() => handleOpen(recurring)}
                    style={{ transform: [{ rotate: "90deg" }] }}
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
          })}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
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
  },
});
