import { ComponentType, PropsWithChildren } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Motion } from "@/constants/motion";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Octicons from "@expo/vector-icons/Octicons";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  title: string;
  IconComponent?: ComponentType<any>;
  iconName?: string;
};

export function Collapsible({
  children,
  title,
  IconComponent,
  iconName,
}: PropsWithChildren & Props) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"].text;

  const isExpanded = useSharedValue(false);
  const contentHeight = useSharedValue(0);

  const rotation = useDerivedValue(() =>
    withTiming(isExpanded.value ? 90 : 0, {
      duration: Motion.duration.normal,
    })
  );

  const animatedHeight = useDerivedValue(() =>
    withTiming(contentHeight.value * Number(isExpanded.value), {
      duration: Motion.duration.normal,
    })
  );

  const animatedContentStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));
  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      style={{
        backgroundColor: Colors[colorScheme ?? "light"].primary[200],
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
      }}
    >
      <TouchableOpacity
        style={styles.heading}
        onPress={() => {
          isExpanded.value = !isExpanded.value;
        }}
        activeOpacity={0.8}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 24,
            alignItems: "center",
          }}
        >
          {IconComponent && iconName && (
            <IconComponent name={iconName} size={17} color={color} />
          )}
          <ThemedText type="bodyLarge" style={{ color: color }}>
            {title}
          </ThemedText>
        </View>
        <Animated.View style={animatedArrowStyle}>
          <Octicons name={"chevron-right"} size={17} color={color} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[animatedContentStyle, { overflow: "hidden" }]}>
        <View
          onLayout={(e) => {
            contentHeight.value = e.nativeEvent.layout.height;
          }}
          style={[
            styles.content,
            {
              position: "absolute",
              width: "100%",
            },
          ]}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "space-between",
  },
  content: {
    marginTop: 4,
    marginHorizontal: 2,
  },
});
