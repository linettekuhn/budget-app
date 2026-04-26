import { CURRENCIES, CurrencyCode, formatCurrency } from "@/utils/currency";

export function formatMoney(params: {
  code?: string;
  amount: number;
  decimals?: boolean;
}) {
  const { code = "USD", amount, decimals = false } = params;
  const rounded = Math.round(amount * 100) / 100;
  const formatted = formatCurrency({ code, amount: rounded })[0].replace(
    " ",
    "",
  );

  if (decimals) {
    const currencyConfig = CURRENCIES[code as CurrencyCode];
    const separator = currencyConfig?.format === "period" ? "," : ".";

    if (!formatted.includes(separator)) return formatted + separator + "00";
    const decimalIndex = formatted.lastIndexOf(separator);
    if (formatted.length - decimalIndex - 1 === 1) return formatted + "0";
    return formatted;
  }

  const currencyConfig = CURRENCIES[code as CurrencyCode];
  const separator = currencyConfig?.format === "period" ? "," : ".";
  const decimalIndex = formatted.lastIndexOf(separator);
  if (decimalIndex !== -1) return formatted.slice(0, decimalIndex);

  return formatted;
}
