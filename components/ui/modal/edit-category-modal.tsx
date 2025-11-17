import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { CategoryType } from "@/types";
import { formatAmountDisplay } from "@/utils/formatAmountDisplay";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
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
import CapsuleToggle from "../capsule-toggle";

type Props = {
  onComplete: () => void;
  category: CategoryType;
};

export default function EditCategory({ onComplete, category }: Props) {
  const db = useSQLiteContext();
  const colorScheme = useColorScheme();

  const [typeSelected, setType] = useState(category.type.toUpperCase());
  const [categoryColor, setCategoryColor] = useState(category.color);
  const [rawAmount, setRawAmount] = useState("");
  const [displayAmount, setDisplayAmount] = useState(
    category.budget.toFixed(2)
  );

  useEffect(() => {
    const formatted = formatAmountDisplay(rawAmount);
    setDisplayAmount(formatted);
  }, []);

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

  const handleUpdateCategory = async () => {
    try {
      if (!categoryColor || !rawAmount || !typeSelected) {
        throw new Error("All fields are required");
      }

      if (parseFloat(rawAmount) === 0) throw new Error("Budget cannot be 0");

      const budget = parseFloat((Number(rawAmount) / 100).toFixed(2));
      const categoryType = typeSelected.toLowerCase() as "need" | "want";

      await db.runAsync(
        `UPDATE categories SET color = ?, type = ?, budget = ? WHERE id = ?`,
        [categoryColor, categoryType, budget, category.id]
      );

      Alert.alert("Success", "Category updated successfully");
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "An error occurred updating category");
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
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ThemedView style={styles.categoryForm}>
          <ThemedText style={styles.heading} type="h1">
            Edit {category.name}
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
            text="UPDATE CATEGORY"
            onPress={handleUpdateCategory}
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
    alignItems: "center",
    gap: 15,
    paddingHorizontal: 20,
    paddingVertical: 20,
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
