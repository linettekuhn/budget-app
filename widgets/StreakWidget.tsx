import { Colors } from "@/constants/theme";
import {
  HStack,
  Image,
  Rectangle,
  Text,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  containerRelativeFrame,
  font,
  foregroundStyle,
  multilineTextAlignment,
  scaleEffect,
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, WidgetEnvironment } from "expo-widgets";

type StreakWidgetProps = {
  currentStreak: number;
  streakMessage: string;
  streakColorStart: string;
  streakColorEnd: string;
  colors: typeof Colors;
  widgetUrl: string;
};

const StreakWidget = (props: StreakWidgetProps, env: WidgetEnvironment) => {
  "widget";
  const scheme = env.colorScheme === "dark" ? "dark" : "light";
  const c = (props.colors ?? Colors)[scheme];

  const url = props.widgetUrl ?? "budgetapp:///(tabs)";
  const mutedColor = c.primary[700];
  const dimmedColor = c.primary[500];

  const streakGradient = {
    type: "linearGradient" as const,
    colors: [props.streakColorStart, props.streakColorEnd],
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 1, y: 0 },
  };

  return (
    <ZStack
      modifiers={[
        containerRelativeFrame({ axes: "both", span: 1, count: 1 }),
        widgetURL(url),
      ]}
    >
      <Rectangle
        modifiers={[
          foregroundStyle({
            type: "linearGradient",
            colors: [c.background, c.primary[200]],
            startPoint: { x: 0.5, y: 0.5 },
            endPoint: { x: 1, y: 1 },
          }),
        ]}
      />
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
    </ZStack>
  );
};

export default createWidget("StreakWidget", StreakWidget);
