import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import CapsuleButton from "@/components/ui/capsule-button";
import CapsuleInput from "@/components/ui/capsule-input-box";
import CapsuleToggle from "@/components/ui/capsule-toggle";
import { Colors } from "@/constants/theme";
import { CategoryType } from "@/types";
import Octicons from "@expo/vector-icons/Octicons";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Transaction() {
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? "light"].text;
  const db = useSQLiteContext();

  const [loading, setLoading] = useState(true);
  const [rawAmount, setRawAmount] = useState("0");
  const [displayAmount, setDisplayAmount] = useState("0.00");
  const [transactionName, setTransactionName] = useState("");
  const [typeSelected, setType] = useState("");
  const [categorySelected, setCategory] = useState<CategoryType | null>(null);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await db.getAllAsync<CategoryType>(
          "SELECT * FROM categories"
        );

        const savedCategories = data.map((row) => {
          const category: CategoryType = {
            id: row.id,
            name: row.name,
            color: row.color,
          };
          return category;
        });

        setCategories(savedCategories);
      } catch (error: unknown) {
        if (error instanceof Error) {
          Alert.alert("Error", error.message);
        } else {
          Alert.alert("An error ocurred loading transactions");
        }
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // TODO: match focus bg colors to category colors
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
      const transaction = {
        name: transactionName.trim(),
        amount: parseFloat((Number(rawAmount) / 100).toFixed(2)),
        type: typeSelected.toLowerCase() as "income" | "expense",
        // TODO: category id
        categoryId: categorySelected.id,
        date: new Date().toISOString(),
      };

      await db.runAsync(
        `
          INSERT INTO transactions (name, amount, type, categoryId, date) 
          VALUES (?, ?, ?, ?, ?);
          `,
        [
          transaction.name,
          transaction.amount,
          transaction.type,
          transaction.categoryId,
          transaction.date,
        ]
      );
      Alert.alert("Success", "Transaction added successfully");

      setTransactionName("");
      setRawAmount("");
      setDisplayAmount("0.00");
      setType("");
      setCategory(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("An error ocurred saving transaction");
      }
    }
  };

  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    setRawAmount(numeric);
    const formatted = formatDisplay(numeric);
    setDisplayAmount(formatted);
  };

  const formatDisplay = (numericOnly: string): string => {
    if (numericOnly === "" || numericOnly === "000") return "0.00";

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
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.main}>
          <ThemedView style={styles.amountWrapper}>
            <Pressable onPress={() => inputRef.current?.focus()}>
              <ThemedText
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.4}
                type="displayLarge"
                style={[styles.amountInput, { color: textColor }]}
              >
                ${displayAmount}
              </ThemedText>
            </Pressable>
            <TextInput
              ref={inputRef}
              value={rawAmount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              style={{ position: "absolute", opacity: 0, height: 0, width: 0 }}
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
              {categories.map((category) => (
                <CapsuleToggle
                  key={category.id}
                  text={category.name}
                  bgFocused={category.color}
                  selected={categorySelected?.id === category.id}
                  onPress={() => setCategory(category)}
                />
              ))}
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
