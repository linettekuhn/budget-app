// detect date string format and parses accordingly
export function parseDate(dateStr: string): Date {
  if (dateStr.includes("T")) return new Date(dateStr);
  if (dateStr.includes(" ")) return new Date(dateStr + "Z");
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}
