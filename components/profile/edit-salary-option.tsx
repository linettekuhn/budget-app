import { Colors, getTheme } from "@/constants/theme";
import { useCurrency } from "@/hooks/useCurrency";
import { useIncomeSources } from "@/hooks/useIncomeSources";
import { useModal } from "@/hooks/useModal";
import WidgetService from "@/services/WidgetService";
import { IncomeSource, PayType } from "@/types";
import { formatAmountDisplay } from "@/utils/formatDisplay";
import { formatMoney } from "@/utils/formatMoney";
import { derivePayAmount } from "@/utils/incomeUtils";
import Octicons from "@expo/vector-icons/Octicons";
import { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";
import AmountDisplay from "../ui/amount-display";
import CapsuleInput from "../ui/capsule-input-box";
import CapsuleNumberInput from "../ui/capsule-input-number";
import CapsuleToggle from "../ui/capsule-toggle";
import SettingsModal from "../ui/modal/settings-modal";
import MoneyText from "../ui/money-text";
import ProfileOption from "./profile-option";

function IncomeSourceForm({
  initialName = "",
  initialType = "Monthly",
  initialBasisAmount = 0,
  initialHoursPerWeek = 0,
  title,
  onSave,
  onCancel,
  currency,
}: {
  initialName?: string;
  initialType?: PayType;
  initialBasisAmount?: number;
  initialHoursPerWeek?: number;
  title: string;
  onSave: (data: {
    name: string;
    basisType: PayType;
    basisAmount: number;
    hoursPerWeek: number | null;
  }) => Promise<void>;
  onCancel: () => void;
  currency: string;
}) {
  const colorScheme = useColorScheme();
  const [sourceName, setSourceName] = useState(initialName);
  const [payType, setPayType] = useState<PayType>(initialType);
  const [rawAmount, setRawAmount] = useState(
    Math.round(initialBasisAmount * 100).toString(),
  );
  const [displayAmount, setDisplayAmount] = useState(
    formatAmountDisplay(rawAmount),
  );
  const [hoursRaw, setHoursRaw] = useState(
    Math.round(initialHoursPerWeek * 100).toString(),
  );
  const [hoursDisplay, setHoursDisplay] = useState(
    formatAmountDisplay(hoursRaw),
  );
  const [previewMonthly, setPreviewMonthly] = useState(0);

  useEffect(() => {
    const amount = parseFloat((Number(rawAmount) / 100).toFixed(2));
    const hours = parseFloat((Number(hoursRaw) / 100).toFixed(2));
    setPreviewMonthly(derivePayAmount(payType, amount, hours));
  }, [rawAmount, hoursRaw, payType]);

  const handleSave = async () => {
    if (!sourceName.trim()) {
      Toast.show({ type: "error", text1: "Please enter a name" });
      return;
    }
    if (!rawAmount || parseFloat(rawAmount) < 1) {
      Toast.show({
        type: "error",
        text1: `Amount must be at least ${formatMoney({ code: currency, amount: 1 })}`,
      });
      return;
    }
    if (payType === "Hourly" && (!hoursRaw || parseFloat(hoursRaw) === 0)) {
      Toast.show({ type: "error", text1: "Hours cannot be 0" });
      return;
    }

    const amount = parseFloat((Number(rawAmount) / 100).toFixed(2));
    const hours = parseFloat((Number(hoursRaw) / 100).toFixed(2));

    await onSave({
      name: sourceName.trim(),
      basisType: payType,
      basisAmount: amount,
      hoursPerWeek: payType === "Hourly" ? hours : null,
    });
  };

  return (
    <SettingsModal onCancel={onCancel} title={title} onComplete={handleSave}>
      <CapsuleInput
        value={sourceName}
        onChangeText={setSourceName}
        placeholder="e.g. Primary Job, Freelance..."
        keyboardType="default"
        IconComponent={Octicons}
        iconName="pencil"
      />
      <ThemedText type="h3">How do you get paid?</ThemedText>
      <ThemedView style={styles.horizontalContainer}>
        {(
          ["Hourly", "Biweekly", "Monthly", "Yearly", "Varies"] as PayType[]
        ).map((type) => (
          <CapsuleToggle
            key={type}
            text={type}
            bgFocused={Colors[getTheme(colorScheme)].primary[500]}
            selected={payType === type}
            onPress={() => {
              Keyboard.dismiss();
              setPayType(type);
            }}
          />
        ))}
      </ThemedView>

      {payType === "Hourly" && (
        <ThemedView style={styles.hourlyWrapper}>
          <View style={styles.quantityWrapper}>
            <ThemedText type="h2">How much?</ThemedText>
            <ThemedView style={styles.amountRow}>
              <AmountDisplay
                currency={currency}
                displayAmount={displayAmount}
                rawAmount={rawAmount}
                onChangeText={(text) => {
                  const numeric = text.replace(/[^0-9]/g, "");
                  setRawAmount(numeric);
                  setDisplayAmount(formatAmountDisplay(numeric));
                }}
                textType="h3"
              />
              <ThemedText type="h3"> per hour</ThemedText>
            </ThemedView>
          </View>
          <View style={{ marginVertical: 10, gap: 5, alignItems: "center" }}>
            <ThemedText type="overline">
              Enter your best average if it varies
            </ThemedText>
            <ThemedView style={styles.amountRow}>
              <CapsuleNumberInput
                displayAmount={hoursDisplay}
                rawAmount={hoursRaw}
                onChangeText={(text) => {
                  const numeric = text.replace(/[^0-9]/g, "");
                  setHoursRaw(numeric);
                  setHoursDisplay(formatAmountDisplay(numeric));
                }}
                textType="h3"
                max={10000}
              />
              <ThemedText type="h3"> hours per week</ThemedText>
            </ThemedView>
          </View>
        </ThemedView>
      )}

      {payType !== "Hourly" && (
        <ThemedView style={styles.quantityWrapper}>
          <ThemedText type="h2">How much?</ThemedText>
          <ThemedView style={styles.amountRow}>
            <AmountDisplay
              currency={currency}
              displayAmount={displayAmount}
              rawAmount={rawAmount}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, "");
                setRawAmount(numeric);
                setDisplayAmount(formatAmountDisplay(numeric));
              }}
              textType="h3"
            />
            <ThemedText type="h3">
              {payType === "Biweekly" && " every 2 weeks"}
              {payType === "Monthly" && " per month"}
              {payType === "Yearly" && " per year"}
              {payType === "Varies" && " per month"}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      )}

      <ThemedView
        style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
      >
        <ThemedText type="h4">Monthly take-home: </ThemedText>
        <MoneyText
          variant="block"
          type="h4"
          amount={previewMonthly}
          currency={currency}
          decimals={true}
          align="left"
        />
      </ThemedView>
    </SettingsModal>
  );
}

export default function ManageIncomeOption({
  onChange,
}: {
  onChange?: () => void;
}) {
  const { openModal, closeModal } = useModal();
  const { sources, addIncomeSource, editIncomeSource, deactivateIncomeSource } =
    useIncomeSources();
  const { currency } = useCurrency();
  const colorScheme = useColorScheme();
  const txtColor = Colors[getTheme(colorScheme)].text;

  const handleAdd = () => {
    openModal(
      <IncomeSourceForm
        title="Add income source"
        onSave={async (data) => {
          await addIncomeSource(data);
          onChange?.();
          await WidgetService.syncAll();
          closeModal();
        }}
        onCancel={closeModal}
        currency={currency ?? "USD"}
      />,
    );
  };

  const handleEdit = (source: IncomeSource) => {
    openModal(
      <IncomeSourceForm
        title="Edit income source"
        initialName={source.name}
        initialType={source.basisType as PayType}
        initialBasisAmount={source.basisAmount}
        initialHoursPerWeek={source.hoursPerWeek ?? 0}
        onSave={async (data) => {
          await editIncomeSource(source.id, data);
          onChange?.();
          await WidgetService.syncAll();
          closeModal();
        }}
        onCancel={closeModal}
        currency={currency ?? "USD"}
      />,
    );
  };

  const handleDeactivate = (source: IncomeSource) => {
    Alert.alert(
      "Remove income source",
      `Remove "${source.name}"? This won't affect past months.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await deactivateIncomeSource(source.id);
            onChange?.();
            await WidgetService.syncAll();
          },
        },
      ],
    );
  };

  return (
    <>
      {sources.map((source) => (
        <ThemedView key={source.id} style={styles.sourceRow}>
          <View style={styles.sourceInfo}>
            <ThemedText type="bodyLarge">{source.name}</ThemedText>
            <ThemedText type="captionSmall">
              {source.basisType} · ${source.payAmount.toFixed(2)}
            </ThemedText>
          </View>
          <View style={styles.sourceActions}>
            <Octicons
              name="pencil"
              size={18}
              color={txtColor}
              onPress={() => handleEdit(source)}
              style={styles.actionIcon}
            />
            <Octicons
              name="trash"
              size={18}
              color={txtColor}
              onPress={() => handleDeactivate(source)}
              style={styles.actionIcon}
            />
          </View>
        </ThemedView>
      ))}
      <ProfileOption text="Add income source" onPress={handleAdd} />
    </>
  );
}

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  hourlyWrapper: {
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 10,
  },
  quantityWrapper: {
    marginVertical: 10,
    alignItems: "center",
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  sourceInfo: {
    flex: 1,
    gap: 2,
  },
  sourceActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionIcon: {
    padding: 4,
  },
});
