import { Colors } from "@/constants/theme";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";
import CapsuleButton from "./capsule-button";
import AppModal from "./modal/modal";

type Props = {
  handleDateChange: (date: Date) => void;
  initialDate: Date;
};

export default function MonthSelect({ handleDateChange, initialDate }: Props) {
  const colorScheme = useColorScheme();
  const [tempDate, setTempDate] = useState<Date>(initialDate);
  const [date, setDate] = useState<Date>(initialDate);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    setDate(initialDate);
  }, [initialDate]);

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

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(new Date(selectedDate));
    }
  };

  const onMonthSelect = (newDate: Date) => {
    setDate(new Date(newDate));
    handleDateChange(newDate);
    setShowPicker(false);
  };

  const handleModalOpen = () => {
    setTempDate(new Date(date));
    setShowPicker(true);
  };

  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  return (
    <ThemedView>
      <Pressable onPress={handleModalOpen}>
        <ThemedText type="displayLarge" style={styles.month}>
          {months[currentMonth].toUpperCase()}
        </ThemedText>
        <ThemedText type="h1" style={styles.year}>
          {currentYear}
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
              value={tempDate}
              mode="date"
              is24Hour={true}
              display="spinner"
              onChange={onChange}
            />
          </ThemedView>
          <CapsuleButton
            text="CHANGE MONTH"
            onPress={() => onMonthSelect(tempDate)}
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
