import { formatCurrency } from "react-native-format-currency";

export function formatMoney(params: { code?: string; amount: number }) {
  const { code = "USD", amount } = params;
  const formatted = formatCurrency({ code, amount })[0];
  return formatted.replace(" ", "");
}
