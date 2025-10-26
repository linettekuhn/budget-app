export const formatAmountDisplay = (numericOnly: string): string => {
  if (numericOnly === "" || numericOnly === "000") return "0.00";

  // pad the number to be at least 3 digits with 0 in the start
  const padded = numericOnly.padStart(3, "0");
  let integer = padded.slice(0, -2);
  const decimal = padded.slice(-2);
  // parse integer part and turn back to string to remove extra leading zeroes
  integer = String(parseInt(integer));
  // add a coma every 3 digits in the integer
  integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${integer}.${decimal}`;
};
