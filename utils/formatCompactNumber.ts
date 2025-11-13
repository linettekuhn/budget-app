export const formatCompactNumber = (num: number): string => {
  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum > 999.99) {
    if (absNum >= 1000000000) {
      return `${sign}${(absNum / 1000000000).toFixed(2)}B`;
    } else if (absNum >= 1000000) {
      return `${sign}${(absNum / 1000000).toFixed(2)}M`;
    } else {
      return `${sign}${(absNum / 1000).toFixed(2)}k`;
    }
  }
  return `${sign}${absNum.toFixed(2)}`;
};
