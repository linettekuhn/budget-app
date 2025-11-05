import calculateSvgArcPath from "./calcuateSvgArcPath";

type Props = {
  spent: number;
  total: number;
  gap: number;
  startAngle: number;
  angleSpan: number;
  radius: number;
  center: number;
};

export default function calculateArcData({
  spent,
  total,
  gap,
  startAngle,
  angleSpan,
  radius,
  center,
}: Props) {
  const drawableAngle = angleSpan - gap;

  let spentPercent = spent / total;
  let overflowPercent = 0;

  if (spentPercent >= 1) {
    overflowPercent = Math.abs(1 - spentPercent);
    spentPercent = 1;
  }

  if (overflowPercent >= 1) {
    overflowPercent = 1;
  }

  const fillAngleSpan = spentPercent * drawableAngle;
  const overflowAngleSpan = overflowPercent * drawableAngle;

  const bgArcPath = calculateSvgArcPath(
    startAngle,
    radius,
    drawableAngle,
    center,
    center
  );

  const fillArcPath = calculateSvgArcPath(
    startAngle,
    radius,
    fillAngleSpan,
    center,
    center
  );

  const overflowArcPath = calculateSvgArcPath(
    startAngle,
    radius,
    overflowAngleSpan,
    center,
    center
  );

  return {
    bgArcPath,
    spentPercent,
    fillArcPath,
    overflowArcPath,
    overflowPercent,
  };
}
