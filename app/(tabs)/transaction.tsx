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
import { useBadgeCheck } from "@/hooks/useBadgeCheck";
import { useCategories } from "@/hooks/useCategories";
import { useModal } from "@/hooks/useModal";
import DatabaseService from "@/services/DatabaseService";
import { CategoryType } from "@/types";
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
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Options, RRule, Weekday } from "rrule";
import { Toast } from "toastify-react-native";

export default function Transaction() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];
  const now = new Date();

  const [rawAmount, setRawAmount] = useState("0");
  const [displayAmount, setDisplayAmount] = useState("0.00");
  const [transactionName, setTransactionName] = useState("");
  const [typeSelected, setType] = useState("");
  const [categorySelected, setCategory] = useState<CategoryType | null>(null);

  const [startDate, setStartDate] = useState(new Date());
  const [isRecurring, setRecurring] = useState(false);
  const [intervalRaw, setIntervalRaw] = useState("1");
  const [intervalDisplay, setIntervalDisplay] = useState("1");
  const [frequency, setFrequency] = useState(RRule.WEEKLY);
  const [weekday, setWeekday] = useState<Weekday>(RRule.MO);
  const [monthDay, setMonthDay] = useState(1);
  const [yearMonth, setYearMonth] = useState(now.getMonth() + 1);

  const { openModal, closeModal } = useModal();
  const { categories, loading, reload } = useCategories();
  const { checkBadges } = useBadgeCheck();

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
    reload();
  }, [reload]);

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
          reload();
        }}
      />
    );
  };

  // TODO: customize date (default current date)
  const handleTransaction = async () => {
    try {
      if (
        !rawAmount ||
        !transactionName ||
        !typeSelected ||
        !categorySelected
      ) {
        throw new Error("All fields are required");
      }

      if (parseFloat(rawAmount) === 0) throw new Error("Amount cannot be 0");

      const transaction = {
        name: transactionName.trim(),
        amount: parseFloat((Number(rawAmount) / 100).toFixed(2)),
        type: typeSelected.toLowerCase() as "income" | "expense",
        categoryId: categorySelected.id,
        date: startDate.toISOString(),
      };

      if (isRecurring) {
        if (!intervalRaw || Number(intervalRaw) < 1) {
          throw new Error("Interval must be at least 1");
        }

        const year = startDate.getUTCFullYear();
        const month = startDate.getUTCMonth();
        const day = startDate.getUTCDate();
        const hours = startDate.getUTCHours();
        const minutes = startDate.getUTCMinutes();
        const seconds = startDate.getUTCSeconds();
        const utcStartDate = new Date(
          year,
          month,
          day,
          hours,
          minutes,
          seconds
        );

        // build RRULE options object
        const rruleOptions: Partial<Options> = {
          freq: frequency,
          interval: Number(intervalRaw),
          dtstart: utcStartDate,
        };

        switch (frequency) {
          case RRule.WEEKLY:
            rruleOptions.byweekday = weekday;
            break;
          case RRule.MONTHLY:
            rruleOptions.bymonthday = Number(monthDay);
            break;
          case RRule.YEARLY:
            rruleOptions.bymonth = Number(yearMonth);
            rruleOptions.bymonthday = Number(monthDay);
            break;
        }

        // create rrule instance with options
        const rrule = new RRule(rruleOptions);

        // compute most recent recurrence date
        const lastDate = rrule.before(new Date(), true);

        if (lastDate) {
          transaction.date = lastDate.toISOString();
        }

        await DatabaseService.addRecurringTransaction({
          ...transaction,
          rrule: rrule.toString(),
        });
        Toast.show({
          type: "success",
          text1: "Recurring transaction added!",
        });
      } else {
        await DatabaseService.addTransaction(transaction);
        Toast.show({
          type: "success",
          text1: "Transaction added!",
        });
      }

      // reset form
      setTransactionName("");
      setRawAmount("");
      setDisplayAmount("0.00");
      setType("");
      setCategory(null);
      setIntervalRaw("1");
      setIntervalDisplay("1");
      setFrequency(RRule.WEEKLY);
      setStartDate(new Date());
      setRecurring(false);

      await checkBadges();
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={Platform.OS === "ios" ? 80 : 100}
          enableOnAndroid={true}
          contentContainerStyle={styles.container}
        >
          <ThemedView style={styles.main}>
            <ThemedView style={styles.options}>
              <AmountDisplay
                displayAmount={displayAmount}
                rawAmount={rawAmount}
                onChangeText={handleAmountChange}
                textType="displayLarge"
              />
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
                color={
                  isRecurring ? btnColor : Colors[colorScheme ?? "light"].text
                }
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
                        Number(intervalRaw) > 1
                          ? option.label + "s"
                          : option.label,
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

            <ThemedView style={styles.options}>
              <ThemedText style={styles.heading} type="h1">
                Name
              </ThemedText>
              <CapsuleInput
                value={transactionName}
                onChangeText={setTransactionName}
                placeholder="Enter transaction name"
                keyboardType="default"
              />
            </ThemedView>

            <ThemedView style={styles.options}>
              <ThemedText style={styles.heading} type="h1">
                Type
              </ThemedText>
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
                Category
              </ThemedText>
              <ThemedView style={styles.horizontalContainer}>
                {categories.map((category) => {
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

            <CapsuleButton
              text="ADD TRANSACTION"
              onPress={() => {
                Keyboard.dismiss();
                handleTransaction();
              }}
              bgFocused={btnColor}
            />
          </ThemedView>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 70,
  },

  main: {
    paddingVertical: 30,
    flex: 1,
    gap: 15,
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
