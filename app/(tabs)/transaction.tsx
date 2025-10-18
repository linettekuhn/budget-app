import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CapsuleToggle from "@/components/ui/capsule-toggle";
import { Colors } from "@/constants/theme";
import Octicons from "@expo/vector-icons/Octicons";
import { useState } from "react";
import { ScrollView, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Transaction() {
  const colorScheme = useColorScheme();
  // TODO: update amount
  const [amount, setAmount] = useState(0);
  const [typeSelected, setType] = useState("");
  const [categorySelected, setCategory] = useState("");

  // TODO: match focus bg colors to category colors
  // TODO: add transaction button
  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.main}>
          <ThemedText style={styles.amount} type="displayLarge">
            ${amount.toFixed(2)}
          </ThemedText>
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
    gap: 40,
  },

  amount: {
    justifyContent: "center",
    textAlign: "center",
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
