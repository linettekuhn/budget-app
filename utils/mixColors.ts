import tinycolor from "tinycolor2";

export default function mixColors(
  baseColor: string,
  otherColor: string,
  mixAmount: number = 50
) {
  const mixed = tinycolor.mix(baseColor, otherColor, mixAmount);

  return mixed.toHexString();
}
