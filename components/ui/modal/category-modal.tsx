import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import DatabaseService from "@/services/DatabaseService";
import { CategorySpend } from "@/types";
import { formatAmountDisplay } from "@/utils/formatAmountDisplay";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  useColorScheme,
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
import CapsuleToggle from "../capsule-toggle";

export default function CustomCategory({
  onComplete,
  category,
}: {
  onComplete: () => void;
  category?: CategorySpend;
}) {
  const colorScheme = useColorScheme();

  const [categoryName, setCategoryName] = useState("");
  const [typeSelected, setType] = useState("");
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

      if (await DatabaseService.checkCategoryNameExists(name)) {
        throw new Error("Category name already exists");
      }

      const categoryType = typeSelected.toLowerCase() as "need" | "want";

      await DatabaseService.addCategory(
        name,
        categoryColor,
        categoryType,
        budget
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ paddingVertical: 0 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ThemedView style={styles.categoryForm}>
          <ThemedText style={styles.heading} type="h1">
            Create a Category
          </ThemedText>
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
              Type
            </ThemedText>
            <ThemedView style={styles.horizontalContainer}>
              <CapsuleToggle
                text="NEED"
                bgFocused={Colors[colorScheme ?? "light"].primary[300]}
                selected={typeSelected === "NEED"}
                onPress={() => setType("NEED")}
              />
              <CapsuleToggle
                text="WANT"
                bgFocused={Colors[colorScheme ?? "light"].primary[300]}
                selected={typeSelected === "WANT"}
                onPress={() => setType("WANT")}
              />
            </ThemedView>
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
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    maxWidth: "95%",
  },

  budgetPreview: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  colorPicker: {
    gap: 20,
    width: "60%",
  },

  horizontalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "nowrap",
    gap: 10,
  },
});
