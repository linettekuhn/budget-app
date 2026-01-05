import { Colors } from "@/constants/theme";
import { ComponentType } from "react";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  onPress: () => void;
  isExpanded: SharedValue<boolean>;
  index: number;
  bgColor: string;
  iconColor?: string;
  IconComponent: ComponentType<any>;
  iconName: string;
};

export default function FloatingIconButton({
  onPress,
  isExpanded,
  index,
  bgColor,
  iconColor,
  IconComponent,
  iconName,
}: Props) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"].text;
  const isOdd = index % 2 === 0;

  const animatedStyle = useAnimatedStyle(() => {
    const moveValueX = isExpanded.value ? (isOdd ? -40 : 40) : 0;
    const moveValueY = isExpanded.value ? -70 : 0;

    const translateX = withSpring(moveValueX);
    const translateY = withSpring(moveValueY);
    const scale = isExpanded.value ? 1 : 0;
    const delay = index * 50;

    return {
      transform: [
        { translateX: translateX },
        { translateY: translateY },
        { scale: withDelay(delay, withTiming(scale)) },
      ],
    };
  });

  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        styles.button,
        styles.shadow,
        { backgroundColor: bgColor },
      ]}
      onPress={onPress}
    >
      <IconComponent name={iconName} size={30} color={iconColor ?? color} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
  },

  shadow: {
    shadowColor: "#171717",
    shadowOffset: { width: -0.5, height: 3.5 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
