import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useState } from "react";
import { View } from "react-native";
import { Path } from "react-native-svg";

type Props = {
  middleAngle: number;
  centerX: number;
  centerY: number;
  radius: number;
  strokeWidth: number;
  color: string;
  label?: string;
};

export function PieChartLabelConnectorLine({
  middleAngle,
  centerX,
  centerY,
  radius,
  strokeWidth,
  color,
}: Props) {
  const { startX, startY, endX, endY } = getLabelPosition({
    middleAngle,
    centerX,
    centerY,
    radius,
    strokeWidth,
    color,
  });
  return (
    <Path
      d={`M ${startX} ${startY} L ${endX} ${endY}`}
      stroke={color}
      strokeWidth={6}
      strokeLinecap="round"
    />
  );
}

export function PieChartLabelText({
  middleAngle,
  centerX,
  centerY,
  radius,
  strokeWidth,
  color,
  label,
}: Props) {
  const [bubbleWidth, setBubbleWidth] = useState(0);

  const { endX, endY, isLeft } = getLabelPosition({
    middleAngle,
    centerX,
    centerY,
    radius,
    strokeWidth,
    color,
  });

  return (
    <View
      onLayout={(e) => {
        setBubbleWidth(e.nativeEvent.layout.width);
      }}
      style={{
        position: "absolute",
        top: endY - 3,
        left: isLeft ? endX - bubbleWidth : endX,
        backgroundColor: color,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderTopLeftRadius: isLeft ? 32 : 0,
        borderTopRightRadius: isLeft ? 0 : 32,
        borderBottomLeftRadius: isLeft ? 32 : 16,
        borderBottomRightRadius: isLeft ? 16 : 32,
      }}
    >
      <ThemedText
        darkColor={Colors["dark"].background}
        lightColor={Colors["light"].background}
        type="captionSmall"
        style={{ fontFamily: "Onest-SemiBold" }}
      >
        {label}
      </ThemedText>
    </View>
  );
}

function getLabelPosition({
  middleAngle,
  centerX,
  centerY,
  radius,
  strokeWidth,
}: Props) {
  const gap = 6;
  const isLeft = Math.abs(middleAngle) > Math.PI / 2;
  const labelRadius = radius + strokeWidth / 2 + gap;
  const lineLength = 12;
  // line start
  const startX = centerX + labelRadius * Math.cos(middleAngle);
  const startY = centerY + labelRadius * Math.sin(middleAngle);

  // line end
  const endX = startX + (isLeft ? -lineLength : lineLength);
  const endY = startY;

  return {
    startX,
    startY,
    endX,
    endY,
    isLeft,
  };
}
