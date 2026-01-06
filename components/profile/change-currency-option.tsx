import { useCurrency } from "@/hooks/useCurrency";
import { useModal } from "@/hooks/useModal";
import { useState } from "react";
import { getSupportedCurrencies } from "react-native-format-currency";
import { Toast } from "toastify-react-native";
import { ThemedText } from "../themed-text";
import CapsuleDropdown from "../ui/capsule-dropdown";
import SettingsModal from "../ui/modal/settings-modal";
import ProfileOption from "./profile-option";

function CurrencyChangeContent({
  initialCurrency,
  onSave,
  onCancel,
}: {
  initialCurrency: string;
  onSave: (currency: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [tempCurrency, setTempCurrency] = useState(initialCurrency);
  const currencies = getSupportedCurrencies();
  const currencyOptions = currencies.map((currency) => ({
    value: currency.code,
    label: currency.name,
  }));

  return (
    <SettingsModal
      onCancel={onCancel}
      title="Change your currency"
      onComplete={async () => {
        try {
          if (!tempCurrency) throw new Error("Please select a currency");
          await onSave(tempCurrency.trim());
        } catch (error: unknown) {
          if (error instanceof Error) {
            Toast.show({
              type: "error",
              text1: error.message,
            });
          } else {
            Toast.show({
              type: "error",
              text1: "An error occurred while updating currency",
            });
          }
        }
      }}
    >
      <ThemedText type="h3">What is your preferred currency?</ThemedText>
      <CapsuleDropdown
        value={tempCurrency}
        options={currencyOptions}
        onChange={setTempCurrency}
      />
    </SettingsModal>
  );
}

export default function ChangeCurrencyOption() {
  const { openModal, closeModal } = useModal();
  const { currency, updateCurrency } = useCurrency();

  const handleCurrencyChange = () => {
    openModal(
      <CurrencyChangeContent
        initialCurrency={currency ?? ""}
        onSave={async (newCurrency) => {
          if (newCurrency === currency) {
            closeModal();
            return;
          }
          await updateCurrency(newCurrency);
          closeModal();
        }}
        onCancel={closeModal}
      />
    );
  };

  return (
    <ProfileOption text="Choose currency" onPress={handleCurrencyChange} />
  );
}
