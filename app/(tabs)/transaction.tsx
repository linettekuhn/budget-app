import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CapsuleButton from "@/components/ui/capsule-button";
import CapsuleInput from "@/components/ui/capsule-input-box";
import CapsuleToggle from "@/components/ui/capsule-toggle";
import { Colors } from "@/constants/theme";
import Octicons from "@expo/vector-icons/Octicons";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Transaction() {
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? "light"].text;

  // TODO: update amount
  const [amount, setAmount] = useState("");
  const [transactionName, setTransactionName] = useState("");
  const [typeSelected, setType] = useState("");
  const [categorySelected, setCategory] = useState("");

  // TODO: match focus bg colors to category colors
  // TODO: add transaction button
  const handleTransaction = () => {};

  const formatInput = (value: string): string => {
    const numericOnly = value.replace(/[^0-9]/g, "");
    return numericOnly;
  };

  const formatDisplay = (numericOnly: string): string => {
    if (numericOnly === "") return numericOnly;

    // pad the number to be at least 3 digits with 0 in the start
    const padded = numericOnly.padStart(3, "0");
    let integer = padded.slice(0, -2);
    const decimal = padded.slice(-2);
    // parse integer part and turn back to string to remove extra leading zeroes
    integer = String(parseInt(integer));
    // add a coma every 3 digits in the integer
    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return `${integer}.${decimal}`;
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.main}>
          <ThemedView style={styles.amountWrapper}>
            <ThemedText style={styles.dollarSign} type="displayLarge">
              $
            </ThemedText>
            <TextInput
              style={[styles.amountInput, { color: textColor }]}
              value={formatDisplay(amount)}
              onChangeText={(text) => setAmount(formatInput(text))}
              keyboardType="numeric"
            />
          </ThemedView>

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
                onPress={() => setType("INCOME")}
              />
              <CapsuleToggle
                text="EXPENSE"
                bgFocused="#CF3D3D"
                IconComponent={Octicons}
                iconName="arrow-down"
                selected={typeSelected === "EXPENSE"}
                onPress={() => setType("EXPENSE")}
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.options}>
            <ThemedText style={styles.heading} type="h1">
              Category
            </ThemedText>
            <ThemedView style={styles.horizontalContainer}>
              {["Food", "Groceries", "Bills", "Transport", "Shopping"].map(
                (category) => (
                  <CapsuleToggle
                    key={category}
                    text={category}
                    bgFocused="#2EA64E"
                    selected={categorySelected === category}
                    onPress={() => setCategory(category)}
                  />
                )
              )}
            </ThemedView>
          </ThemedView>

          <CapsuleButton
            text="ADD TRANSACTION"
            onPress={handleTransaction}
            bgFocused={Colors[colorScheme ?? "light"].secondary1}
          />
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

  amountWrapper: {
    width: "100%",
    height: 100,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    position: "relative",
  },

  amountDisplay: {
    height: 80,
    justifyContent: "center",
    textAlign: "center",
  },

  amountInput: {
    textAlign: "center",
    padding: 0,
    margin: 0,
    zIndex: 1,
    fontFamily: "BricolageGrotesque-ExtraBold",
    fontSize: 64,
    lineHeight: 70,
    letterSpacing: 0.015,
    marginBottom: -6,
  },

  dollarSign: {
    lineHeight: 70,
    fontSize: 64,
  },

  heading: {
    marginVertical: 10,
  },

  options: {
    flexDirection: "column",
    alignItems: "center",
  },

  horizontalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },
});
