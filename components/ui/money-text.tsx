// components/ui/money-text.tsx

import { ThemedText, ThemedTextProps } from "@/components/themed-text";
import { formatMoney } from "@/utils/formatMoney";
import { StyleProp, TextStyle } from "react-native";

/**
 * VARIANTS
 *
 * "inline"  — sits inside a flex row alongside other text.
 *             Takes flex: 1, aligns right, shrinks font to fit.
 *             Use for: category-budget-preview, transaction rows, etc.
 *
 * "hero"    — centered display amount in a bounded container
 *             (e.g. inside a pie chart). No flex, aligns center.
 *             Use for: pie chart center, summary totals.
 *
 * "block"   — shrinks to fit available space in a row. Siblings stay
 *             rigid at their natural size. Use flexShrink + minWidth
 *             so it compresses without disappearing entirely.
 *             Use for: recurring transaction rows, any row where the
 *             amount is secondary to a label.
 *
 * "pair"    — renders "X / Y" from two amounts as a single text node
 *             so both numbers shrink together at the same scale.
 *             Use for: spent/budget rows.
 */
export type MoneyTextVariant = "inline" | "hero" | "block" | "pair";

type BaseProps = Omit<ThemedTextProps, "children"> & {
  currency: string;
  decimals?: boolean;
  sign?: "auto" | "positive" | "negative" | "none";
  minimumFontScale?: number;
  align?: "left" | "center" | "right";
  noShrink?: boolean;
};

type SingleProps = BaseProps & {
  variant?: Exclude<MoneyTextVariant, "pair">;
  amount: number;
  secondAmount?: never;
  separator?: never;
};

type PairProps = BaseProps & {
  variant: "pair";
  amount: number;
  secondAmount: number;
  separator?: string;
};

type MoneyTextProps = SingleProps | PairProps;

export default function MoneyText({
  amount,
  currency,
  sign,
  decimals = false,
  variant = "inline",
  minimumFontScale = 0.6,
  align,
  noShrink = false,
  style,
  ...rest
}: MoneyTextProps) {
  const isPair = variant === "pair";
  const separator = isPair ? ((rest as PairProps).separator ?? " / ") : null;
  const secondAmount = isPair ? (rest as PairProps).secondAmount : undefined;

  const { secondAmount: _sa, separator: _sep, ...textRest } = rest as PairProps;

  const getDisplaySign = () => {
    if (!sign || sign === "none") return "";

    if (sign === "positive") return "+";
    if (sign === "negative") return "-";

    if (sign === "auto") {
      if (amount > 0) return "+";
      if (amount < 0) return "-";
    }

    return "";
  };

  const signPrefix = getDisplaySign();

  const absAmount = Math.abs(amount);
  const absSecondAmount = Math.abs(secondAmount ?? 0);

  const formatted = isPair
    ? `${signPrefix}${formatMoney({
        code: currency,
        amount: absAmount,
        decimals,
      })}${separator}${formatMoney({
        code: currency,
        amount: absSecondAmount,
        decimals,
      })}`
    : `${signPrefix}${formatMoney({
        code: currency,
        amount: absAmount,
        decimals,
      })}`;

  const variantStyle: StyleProp<TextStyle> = (() => {
    switch (variant) {
      case "inline":
        return {
          flex: 1,
          textAlign: align ?? "right",
          lineHeight: undefined,
        };
      case "hero":
        return {
          textAlign: align ?? "center",
          lineHeight: undefined,
        };
      case "block":
        return {
          flexShrink: 1,
          minWidth: 40,
          textAlign: align ?? "right",
          lineHeight: undefined,
        };
      case "pair":
        return {
          flex: 1,
          textAlign: align ?? "right",
          lineHeight: undefined,
        };
    }
  })();

  return (
    <ThemedText
      numberOfLines={noShrink ? undefined : 1}
      adjustsFontSizeToFit={!noShrink}
      minimumFontScale={noShrink ? undefined : minimumFontScale}
      style={[variantStyle, style]}
      {...textRest}
    >
      {formatted}
    </ThemedText>
  );
}
