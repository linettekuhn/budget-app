import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AmountDisplay from "@/components/ui/amount-display";
import CapsuleButton from "@/components/ui/capsule-button";
import CapsuleDropdown from "@/components/ui/capsule-dropdown";
import CapsuleInput from "@/components/ui/capsule-input-box";
import CapsuleNumberInteger from "@/components/ui/capsule-input-integer";
import CapsuleToggle from "@/components/ui/capsule-toggle";
import CustomCategory from "@/components/ui/modal/category-modal";
import { Colors } from "@/constants/theme";
import { useCategories } from "@/hooks/useCategories";
import { useCategoriesSpend } from "@/hooks/useCategoriesSpend";
import { useCurrency } from "@/hooks/useCurrency";
import { useModal } from "@/hooks/useModal";
import {
  CategoryType,
  TransactionFormData,
  TransactionFormInitial,
} from "@/types";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import {
  formatAmountDisplay,
  formatIntegerDisplay,
} from "@/utils/formatDisplay";
import Octicons from "@expo/vector-icons/Octicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Checkbox } from "expo-checkbox";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { RRule, Weekday } from "rrule";

type Props = {
  initial?: TransactionFormInitial;
  onChange: (data: TransactionFormData) => void;
};

export default function TransactionForm({ initial, onChange }: Props) {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];
  const now = new Date();

  const [rawAmount, setRawAmount] = useState(initial?.rawAmount ?? "0");
  const [displayAmount, setDisplayAmount] = useState(
    formatAmountDisplay(initial?.rawAmount ?? "0")
  );
  const [transactionName, setTransactionName] = useState(initial?.name ?? "");
  const [typeSelected, setType] = useState(initial?.type ?? "");
  const [categorySelected, setCategory] = useState<CategoryType | null>(null);

  const [startDate, setStartDate] = useState(initial?.date ?? now);
  const [isRecurring, setRecurring] = useState(
    initial?.recurrence.isRecurring ?? false
  );
  const [intervalRaw, setIntervalRaw] = useState(
    initial?.recurrence.interval ?? "1"
  );
  const [intervalDisplay, setIntervalDisplay] = useState(
    formatIntegerDisplay(initial?.recurrence.interval ?? "1")
  );
  const [frequency, setFrequency] = useState(
    initial?.recurrence.frequency ?? RRule.WEEKLY
  );
  const [weekday, setWeekday] = useState<Weekday>(
    initial?.recurrence.weekday ?? RRule.MO
  );
  const [monthDay, setMonthDay] = useState(initial?.recurrence.monthDay ?? 1);
  const [yearMonth, setYearMonth] = useState(
    initial?.recurrence.yearMonth ?? now.getMonth() + 1
  );
  const [showAllCategories, setShowAllCategories] = useState(false);

  const { openModal, closeModal } = useModal();
  const {
    categories,
    loading: loadingCategories,
    reload: reloadCategories,
  } = useCategories();
  const {
    budgets,
    loading: loadingSpend,
    reload: reloadSpend,
  } = useCategoriesSpend();
  const { currency, loading: loadingCurrency } = useCurrency();

  // sort categories by budget and show top 3 by default
  const sortedCategories = useMemo(() => {
    const categoryToBudgetMap = new Map(
      budgets.map((budget) => [budget.id, budget.budget])
    );

    return [...categories].sort((a, b) => {
      const budgetA = categoryToBudgetMap.get(a.id) ?? 0;
      const budgetB = categoryToBudgetMap.get(b.id) ?? 0;
      return budgetB - budgetA;
    });
  }, [budgets, categories]);

  const topThreeCategories = sortedCategories.slice(0, 3);
  const otherCategories = sortedCategories.slice(3);
  const displayCategories = showAllCategories
    ? sortedCategories
    : topThreeCategories;

  const recurrenceOptions = [
    { label: "Week", value: RRule.WEEKLY },
    { label: "Month", value: RRule.MONTHLY },
    { label: "Year", value: RRule.YEARLY },
  ];
  const weekdays = useMemo(
    () => [
      { label: "Monday", value: RRule.MO },
      { label: "Tuesday", value: RRule.TU },
      { label: "Wednesday", value: RRule.WE },
      { label: "Thursday", value: RRule.TH },
      { label: "Friday", value: RRule.FR },
      { label: "Saturday", value: RRule.SA },
      { label: "Sunday", value: RRule.SU },
    ],
    []
  );
  const months = useMemo(
    () => [
      { label: "January", value: 1 },
      { label: "February", value: 2 },
      { label: "March", value: 3 },
      { label: "April", value: 4 },
      { label: "May", value: 5 },
      { label: "June", value: 6 },
      { label: "July", value: 7 },
      { label: "August", value: 8 },
      { label: "September", value: 9 },
      { label: "October", value: 10 },
      { label: "November", value: 11 },
      { label: "December", value: 12 },
    ],
    []
  );

  useEffect(() => {
    reloadCategories();
    reloadSpend();
  }, [reloadCategories, reloadSpend]);

  // trigger parent callback whenever a value changes
  useEffect(() => {
    const formData: TransactionFormData = {
      name: transactionName,
      rawAmount,
      type: typeSelected,
      categoryId: categorySelected?.id ?? "",
      date: startDate,
      isRecurring,
      interval: intervalRaw,
      frequency,
      weekday,
      monthDay,
      yearMonth,
    };

    onChange(formData);
  }, [
    transactionName,
    rawAmount,
    typeSelected,
    categorySelected,
    startDate,
    intervalRaw,
    frequency,
    isRecurring,
    weekday,
    monthDay,
    yearMonth,
    onChange,
  ]);

  useEffect(() => {
    if (!initial?.categoryId) return;

    const foundCategory =
      categories.find((c) => c.id === initial.categoryId) ?? null;

    setCategory(foundCategory);
  }, [initial?.categoryId, categories]);

  useEffect(() => {
    const weekdayOption = weekdays.find(
      (weekday) => weekday.value.weekday === startDate.getDay()
    );
    if (weekdayOption) {
      setWeekday(weekdayOption.value);
    }
    setMonthDay(startDate.getDate());
    const monthOption = months.find(
      (month) => month.value === startDate.getMonth() + 1
    );
    if (monthOption) {
      setYearMonth(monthOption.value);
    }
  }, [startDate, months, weekdays]);

  const handleOpen = () => {
    openModal(
      <CustomCategory
        onComplete={() => {
          closeModal();
          reloadCategories();
          reloadSpend();
        }}
      />
    );
  };

  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    setRawAmount(numeric);
    const formatted = formatAmountDisplay(numeric);
    setDisplayAmount(formatted);
  };

  const handleIntervalChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    setIntervalRaw(numeric);
    const formatted = formatIntegerDisplay(numeric);
    setIntervalDisplay(formatted);
  };

  if (loadingCategories || loadingSpend || loadingCurrency) {
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
    <ThemedView style={styles.main}>
      <ThemedView style={styles.options}>
        <ThemedView style={styles.horizontalContainer}>
          <CapsuleToggle
            text="INCOME"
            bgFocused="#2EA64E"
            IconComponent={Octicons}
            iconName="arrow-up"
            selected={typeSelected === "INCOME"}
            onPress={() => {
              Keyboard.dismiss();
              setType("INCOME");
            }}
          />
          <CapsuleToggle
            text="EXPENSE"
            bgFocused="#CF3D3D"
            IconComponent={Octicons}
            iconName="arrow-down"
            selected={typeSelected === "EXPENSE"}
            onPress={() => {
              Keyboard.dismiss();
              setType("EXPENSE");
            }}
          />
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.options}>
        <ThemedText style={styles.heading} type="h1">
          Amount
        </ThemedText>
        <AmountDisplay
          currency={currency}
          displayAmount={displayAmount}
          rawAmount={rawAmount}
          onChangeText={handleAmountChange}
          textType="displayLarge"
        />
      </ThemedView>
      <ThemedView style={[styles.options, { alignItems: "stretch" }]}>
        <ThemedText style={styles.heading} type="h1">
          Name
        </ThemedText>
        <CapsuleInput
          style={{ flex: 1 }}
          value={transactionName}
          onChangeText={setTransactionName}
          placeholder="Enter transaction name"
          keyboardType="default"
        />
      </ThemedView>

      <ThemedView style={styles.options}>
        <ThemedText style={styles.heading} type="h1">
          Category
        </ThemedText>
        <ThemedView style={styles.horizontalContainer}>
          {displayCategories.map((category) => {
            const categoryColor = adjustColorForScheme(
              category.color,
              colorScheme
            );
            return (
              <CapsuleToggle
                key={category.id}
                text={category.name}
                bgFocused={categoryColor}
                selected={categorySelected?.id === category.id}
                onPress={() => {
                  Keyboard.dismiss();
                  setCategory(category);
                }}
              />
            );
          })}
          {!showAllCategories && otherCategories.length > 0 && (
            <CapsuleButton
              onPress={() => {
                Keyboard.dismiss();
                setShowAllCategories(true);
              }}
              text="See More"
              bgFocused={btnColor}
              bgDefault={Colors[colorScheme ?? "light"].primary[200]}
              iconName="chevron-down"
              IconComponent={Octicons}
            />
          )}
          {showAllCategories && otherCategories.length > 0 && (
            <CapsuleButton
              onPress={() => {
                Keyboard.dismiss();
                setShowAllCategories(false);
              }}
              text="See Less"
              bgFocused={btnColor}
              bgDefault={Colors[colorScheme ?? "light"].primary[200]}
              iconName="chevron-up"
              IconComponent={Octicons}
            />
          )}
          <CapsuleButton
            onPress={() => {
              Keyboard.dismiss();
              handleOpen();
            }}
            text="New Category"
            bgFocused={btnColor}
            bgDefault={Colors[colorScheme ?? "light"].primary[200]}
            iconName="plus"
            IconComponent={Octicons}
          />
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.options}>
        <ThemedText style={styles.heading} type="h1">
          Date
        </ThemedText>
        <DateTimePicker
          value={startDate}
          mode="date"
          is24Hour={true}
          display={Platform.OS === "ios" ? "compact" : "default"}
          onChange={(event, selectedDate?: Date) => {
            if (selectedDate) {
              setStartDate(selectedDate);
            }
          }}
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            marginLeft: -10,
          }}
        />
      </ThemedView>

      <ThemedView
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Checkbox
          value={isRecurring}
          onValueChange={setRecurring}
          color={isRecurring ? btnColor : Colors[colorScheme ?? "light"].text}
        />
        <ThemedText type="h3">Mark as recurring</ThemedText>
      </ThemedView>
      {isRecurring && (
        <ThemedView style={styles.options}>
          <ThemedView style={styles.horizontalContainer}>
            <ThemedText style={styles.heading} type="h3">
              Repeat every
            </ThemedText>
            <CapsuleNumberInteger
              displayAmount={intervalDisplay}
              rawAmount={intervalRaw}
              min={1}
              max={10000}
              textType="bodyLarge"
              onChangeText={handleIntervalChange}
            />
            <CapsuleDropdown
              options={recurrenceOptions.map((option) => ({
                label:
                  Number(intervalRaw) > 1 ? option.label + "s" : option.label,
                value: option.value,
              }))}
              value={frequency}
              onChange={setFrequency}
              textType="bodyLarge"
            />
          </ThemedView>
          <ThemedView style={styles.horizontalContainer}>
            <ThemedText style={styles.heading} type="h3">
              on
            </ThemedText>
            {frequency === RRule.WEEKLY && (
              <CapsuleDropdown
                options={weekdays}
                value={weekday}
                onChange={setWeekday}
              />
            )}
            {frequency === RRule.MONTHLY && (
              <>
                <ThemedText style={styles.heading} type="h3">
                  the
                </ThemedText>
                <CapsuleNumberInteger
                  displayAmount={monthDay.toString()}
                  rawAmount={monthDay.toString()}
                  min={1}
                  max={31}
                  textType="bodyLarge"
                  onChangeText={(text) => setMonthDay(Number(text))}
                />
                <ThemedText style={styles.heading} type="h3">
                  of the month{" "}
                </ThemedText>
              </>
            )}
            {frequency === RRule.YEARLY && (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <ThemedText style={styles.heading} type="h3">
                  the
                </ThemedText>
                <CapsuleNumberInteger
                  displayAmount={monthDay.toString()}
                  rawAmount={monthDay.toString()}
                  min={1}
                  max={31}
                  textType="bodyLarge"
                  onChangeText={(text) => setMonthDay(Number(text))}
                />
                <ThemedText style={styles.heading} type="h3">
                  of
                </ThemedText>
                <CapsuleDropdown
                  options={months}
                  value={yearMonth}
                  onChange={setYearMonth}
                />
              </View>
            )}
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    gap: 8,
    marginBottom: 15,
  },

  amountWrapper: {
    width: "100%",
    height: 100,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    position: "relative",
  },

  amountInput: {
    textAlign: "center",
    padding: 0,
    margin: 0,
    zIndex: 1,
  },

  heading: {
    marginVertical: 10,
    marginHorizontal: "auto",
  },

  options: {
    flexDirection: "column",
    alignItems: "center",
  },

  horizontalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 8,
  },
});
