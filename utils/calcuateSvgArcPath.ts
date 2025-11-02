export default function calculateSvgArcPath(
  prevEndAngle: number,
  radius: number,
  angleSpan: number,
  cx: number = 0,
  cy: number = 0
): string {
  const startAngle = prevEndAngle;
  const endAngle = startAngle + angleSpan;

  const startCoords = {
    x: cx + radius * Math.cos(startAngle),
    y: cy + radius * Math.sin(startAngle),
  };

  const endCoords = {
    x: cx + radius * Math.cos(endAngle),
    y: cy + radius * Math.sin(endAngle),
  };

  const largeArcFlag = angleSpan <= Math.PI ? "0" : 1;

  return `M ${startCoords.x} ${startCoords.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endCoords.x} ${endCoords.y}`;
}
