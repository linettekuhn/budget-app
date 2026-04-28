import { Colors } from "@/constants/theme";
import { HStack, Image, Text, VStack } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  multilineTextAlignment,
  scaleEffect,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, WidgetEnvironment } from "expo-widgets";

type StreakWidgetProps = {
  currentStreak: number;
  streakMessage: string;
  streakColorStart: string;
  streakColorEnd: string;
  colors: typeof Colors;
};

const StreakWidget = (props: StreakWidgetProps, env: WidgetEnvironment) => {
  "widget";
  const scheme = env.colorScheme === "dark" ? "dark" : "light";
  const c = (props.colors ?? Colors)[scheme];

  const mutedColor = c.primary[700];
  const dimmedColor = c.primary[500];

  const streakGradient = {
    type: "linearGradient" as const,
    colors: [props.streakColorStart, props.streakColorEnd],
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 1, y: 0 },
  };

  return (
    <VStack>
      <Text
        modifiers={[
          font({ size: 10, weight: "semibold" }),
          foregroundStyle(mutedColor),
        ]}
      >
        BUDGET STREAK
      </Text>
      <HStack spacing={4}>
        <Image
          systemName="flame.fill"
          color={props.streakColorStart}
          modifiers={[foregroundStyle("red"), scaleEffect(1.4)]}
        />
        <Text
          modifiers={[
            font({ size: 48, weight: "bold" }),
            foregroundStyle(streakGradient),
          ]}
        >
          {props.currentStreak}
        </Text>
      </HStack>
      <Text
        modifiers={[
          font({ size: 11 }),
          foregroundStyle(dimmedColor),
          multilineTextAlignment("leading"),
        ]}
      >
        {props.streakMessage}
      </Text>
    </VStack>
  );
};

export default createWidget("StreakWidget", StreakWidget);
