import { formatCurrency } from "react-native-format-currency";

export default function getCurrencySymbol(params: { code?: string }) {
  const { code = "USD" } = params;
  const symbol = formatCurrency({ code, amount: 0 })[2];
  return symbol;
}
