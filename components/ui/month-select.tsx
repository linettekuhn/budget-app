import { Colors } from "@/constants/theme";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";
import CapsuleButton from "./capsule-button";
import AppModal from "./modal/modal";

type Props = {
  handleDateChange: (date: Date) => void;
};

export default function MonthSelect({ handleDateChange }: Props) {
  const colorScheme = useColorScheme();
  const [localDate, setLocalDate] = useState<Date | undefined>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const onChange = (event: DateTimePickerEvent, date?: Date) => {
    const currentDate = date;
    setLocalDate(currentDate);
  };

  const onMonthSelect = (newDate: Date) => {
    setDate(newDate);
    handleDateChange(newDate);
    setShowPicker(false);
  };

  if (!localDate || !date) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <ThemedView>
      <Pressable onPress={() => setShowPicker((prev) => !prev)}>
        <ThemedText type="displayLarge" style={styles.month}>
          {months[date.getMonth()].toUpperCase()}
        </ThemedText>
        <ThemedText type="h1" style={styles.year}>
          {date.getFullYear()}
        </ThemedText>
      </Pressable>
      {showPicker && (
        <AppModal visible={showPicker} onClose={() => setShowPicker(false)}>
          <ThemedView style={styles.datePickerModal}>
            <ThemedText type="h1">Select a month</ThemedText>
            <CapsuleButton
              text="CURRENT MONTH"
              onPress={() => onMonthSelect(new Date())}
              bgDefault={Colors[colorScheme ?? "light"].primary[200]}
              bgFocused={Colors[colorScheme ?? "light"].primary[200]}
            />
            <DateTimePicker
              value={localDate}
              mode="date"
              is24Hour={true}
              display="spinner"
              onChange={onChange}
            />
          </ThemedView>
          <CapsuleButton
            text="CHANGE MONTH"
            onPress={() => onMonthSelect(localDate)}
            bgFocused={Colors[colorScheme ?? "light"].primary[500]}
          />
        </AppModal>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  datePickerModal: {
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 20,
  },
  month: {
    fontSize: 50,
    lineHeight: 0,
  },

  year: {
    fontFamily: "Onest-SemiBold",
    fontSize: 30,
    lineHeight: 0,
  },
});
