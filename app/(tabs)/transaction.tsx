import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AmountDisplay from "@/components/ui/amount-display";
import CapsuleButton from "@/components/ui/capsule-button";
import CapsuleInput from "@/components/ui/capsule-input-box";
import CapsuleToggle from "@/components/ui/capsule-toggle";
import CustomCategory from "@/components/ui/modal/category-modal";
import { Colors } from "@/constants/theme";
import { useBadgeCheck } from "@/hooks/useBadgeCheck";
import { useCategories } from "@/hooks/useCategories";
import { useModal } from "@/hooks/useModal";
import DatabaseService from "@/services/DatabaseService";
import { CategoryType } from "@/types";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import { formatAmountDisplay } from "@/utils/formatAmountDisplay";
import Octicons from "@expo/vector-icons/Octicons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  useColorScheme,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function Transaction() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];

  const [rawAmount, setRawAmount] = useState("0");
  const [displayAmount, setDisplayAmount] = useState("0.00");
  const [transactionName, setTransactionName] = useState("");
  const [typeSelected, setType] = useState("");
  const [categorySelected, setCategory] = useState<CategoryType | null>(null);

  const { openModal, closeModal } = useModal();
  const { categories, loading, reload } = useCategories();
  const { checkBadges } = useBadgeCheck();

  useEffect(() => {
    reload();
  }, [reload]);

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
        date: new Date().toISOString(),
      };

      await DatabaseService.addTransaction(transaction);
      await checkBadges();
      Toast.show({
        type: "success",
        text1: "Transaction added!",
      });

      setTransactionName("");
      setRawAmount("");
      setDisplayAmount("0.00");
      setType("");
      setCategory(null);
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
    gap: 10,
  },
});
