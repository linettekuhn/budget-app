import getCurrencySymbol from "@/utils/getCurrencySymbol";
import CapsuleNumberInput from "./capsule-input-number";

type Props = {
  displayAmount: string;
  rawAmount: string;
  onChangeText: (text: string) => void;
  min?: number;
  max?: number;
  currency?: string;
  textType?:
    | "displayLarge"
    | "displayMedium"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "body"
    | "bodyLarge"
    | "bodySmall"
    | "caption"
    | "captionLarge"
    | "captionSmall"
    | "overline"
    | "link";
};

export default function AmountDisplay({
  displayAmount,
  rawAmount,
  onChangeText,
  min = 0,
  max = 1_000_000_000,
  currency = "USD",
  textType,
}: Props) {
  return (
    <CapsuleNumberInput
      displayAmount={`${getCurrencySymbol({ code: currency })}${displayAmount}`}
      rawAmount={rawAmount}
      onChangeText={onChangeText}
      min={min}
      max={max}
      textType={textType}
    />
  );
}
