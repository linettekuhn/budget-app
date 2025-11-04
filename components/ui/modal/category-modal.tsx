import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { formatAmountDisplay } from "@/utils/formatAmountDisplay";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import ColorPicker, {
  BrightnessSlider,
  ColorFormatsObject,
  Panel3,
  Swatches,
} from "reanimated-color-picker";
import AmountDisplay from "../amount-display";
import CapsuleButton from "../capsule-button";
import CapsuleInput from "../capsule-input-box";

export default function CustomCategory({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const db = useSQLiteContext();

  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#ff3be8");
  const [rawAmount, setRawAmount] = useState("0");
  const [displayAmount, setDisplayAmount] = useState("0.00");

  const handleColorChange = (colors: ColorFormatsObject) => {
    try {
      const color = colors?.hex;
      setCategoryColor(color);
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error in handleColorChange:", error.message);
      }
    }
  };

  const handleAddCategory = async () => {
    try {
      if (!categoryName || !categoryColor || !rawAmount) {
        throw new Error("All fields are required");
      }

      if (parseFloat(rawAmount) === 0) throw new Error("Amount cannot be 0");

      // remove extra spaces
      let name = categoryName.trim();

      if (!name) {
        throw new Error("Category name cannot be empty");
      }

      // capitalize first letter in words
      name = name
        .split(" ")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ");

      const budget = parseFloat((Number(rawAmount) / 100).toFixed(2));

      type CountResult = { count: number };
      const existing = await db.getAllAsync<CountResult>(
        "SELECT COUNT(*) as count FROM categories WHERE name = ?",
        [name]
      );

      if (existing[0].count !== 0) {
        throw new Error("Category name already exists");
      }

      await db.runAsync(
        `INSERT INTO categories (name, color, budget) VALUES (?, ?, ?)`,
        [name, categoryColor, budget]
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("An error occurred saving category");
      }
    } finally {
      onComplete();
    }
  };

  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    setRawAmount(numeric);
    const formatted = formatAmountDisplay(numeric);
    setDisplayAmount(formatted);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ThemedView style={styles.categoryForm}>
          <ThemedText style={styles.heading} type="h1">
            Create a Category
          </ThemedText>
          <ThemedView style={styles.budgetPreview}>
            <ThemedText style={styles.heading} type="h2">
              Budget
            </ThemedText>
            <AmountDisplay
              displayAmount={displayAmount}
              rawAmount={rawAmount}
              onChangeText={handleAmountChange}
              textType="h2"
            />
          </ThemedView>
          <ThemedView style={styles.options}>
            <ThemedText style={styles.heading} type="h2">
              Name
            </ThemedText>
            <CapsuleInput
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Enter category name"
              keyboardType="default"
            />
          </ThemedView>
          <ThemedView style={styles.options}>
            <ColorPicker
              style={styles.colorPicker}
              value={categoryColor}
              onChangeJS={handleColorChange}
            >
              <ThemedView style={styles.colorPreviewWrapper}>
                <ThemedText type="h2">Color</ThemedText>
                <View
                  style={[
                    styles.colorPreview,
                    { backgroundColor: categoryColor },
                  ]}
                ></View>
              </ThemedView>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 25,
                }}
              >
                <Panel3
                  centerChannel="saturation"
                  style={{ maxHeight: 150, maxWidth: 150, flex: 1 }}
                />
                <BrightnessSlider vertical />
              </View>
              <Swatches
                colors={[
                  "#F44336",
                  "#E91E63",
                  "#9C27B0",
                  "#3F51B5",
                  "#00BCD4",
                  "#009688",
                  "#8BC34A",
                  "#CDDC39",
                ]}
              />
            </ColorPicker>
          </ThemedView>
          <CapsuleButton
            text="ADD CATEGORY"
            onPress={handleAddCategory}
            bgFocused={categoryColor}
          />
        </ThemedView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginVertical: 10,
    marginHorizontal: "auto",
  },

  options: {
    flexDirection: "column",
    alignItems: "center",
  },

  budgetPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 25,
    maxWidth: "60%",
    marginHorizontal: 1,
  },

  colorPreviewWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 25,
  },

  colorPreview: {
    flex: 1,
    height: 20,
    borderRadius: 25,
  },

  categoryForm: {
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
  },

  colorPicker: {
    gap: 20,
    maxWidth: "60%",
  },
});
