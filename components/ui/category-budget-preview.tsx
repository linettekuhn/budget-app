import { Motion } from "@/constants/motion";
import { Colors } from "@/constants/theme";
import { CategorySpend } from "@/types";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import mixColors from "@/utils/mixColors";
import Octicons from "@expo/vector-icons/Octicons";
import { useEffect } from "react";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import tinycolor from "tinycolor2";
import { ThemedText } from "../themed-text";

type Props = {
  category: CategorySpend;
  onPress: () => void;
};

export default function CategoryBudgetPreview({ category, onPress }: Props) {
  let spent = category.totalSpent / category.budget;
  let overflow = 0;
  if (spent >= 1) {
    overflow = Math.abs(1 - spent);
    spent = 1;
  }
  if (overflow >= 1) {
    overflow = 1;
  }
  const colorScheme = useColorScheme();

  const previewBgColor = Colors[colorScheme ?? "light"].primary[700];

  const categoryColor = adjustColorForScheme(category.color, colorScheme, 30);
  const bgColor = tinycolor(categoryColor).setAlpha(0.4).toRgbString();
  const overflowColor = mixColors(categoryColor, "#ff0000", 70);

  const fillProgress = useSharedValue(0);
  const overflowProgress = useSharedValue(0);
  const scale = useSharedValue(Motion.scale.default);
  const translateX = useSharedValue(0);

  useEffect(() => {
    fillProgress.value = withTiming(spent, { duration: Motion.duration.slow });
    overflowProgress.value = withDelay(
      Motion.duration.normal,
      withTiming(overflow, {
        duration: Motion.duration.slow,
      })
    );
  }, [spent, overflow, fillProgress, overflowProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value * 100}%`,
  }));
  const overflowAnimatedStyle = useAnimatedStyle(() => ({
    width: `${overflowProgress.value * 100}%`,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        key={category.id}
        style={[
          styles.category,
          {
            backgroundColor: previewBgColor,
          },
        ]}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(Motion.scale.press, {
            duration: Motion.duration.fast,
          });
          translateX.value = withTiming(Motion.translate.small, {
            duration: Motion.duration.fast,
          });
        }}
        onPressOut={() => {
          scale.value = withTiming(Motion.scale.default, {
            duration: Motion.duration.fast,
          });
          translateX.value = withTiming(0, {
            duration: Motion.duration.fast,
          });
        }}
      >
        <View style={styles.categoryData}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ThemedText
              type="bodyLarge"
              darkColor={Colors["dark"].background}
              lightColor={Colors["light"].background}
            >
              {category.name
                .split(" ")
                .map((word) => word[0].toUpperCase() + word.slice(1))
                .join(" ")}{" "}
            </ThemedText>
            <Animated.View style={arrowAnimatedStyle}>
              <Octicons
                name="chevron-right"
                size={20}
                color={Colors[colorScheme ?? "light"].background}
              />
            </Animated.View>
          </View>

          <ThemedText
            type="body"
            darkColor={Colors["dark"].background}
            lightColor={Colors["light"].background}
          >
            ${category.totalSpent} / ${category.budget}
          </ThemedText>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.backBar, { backgroundColor: bgColor }]} />
          <Animated.View
            style={[
              styles.frontBar,
              fillAnimatedStyle,
              {
                backgroundColor: categoryColor,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.overflow,
              overflowAnimatedStyle,
              {
                backgroundColor: overflowColor,
              },
            ]}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  category: {
    borderRadius: 25,
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 10,
  },

  categoryData: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  progressBar: {
    flex: 1,
    height: 10,
  },

  backBar: {
    height: 6,
    width: "100%",
    borderRadius: 3,
  },

  frontBar: {
    height: 10,
    borderRadius: 5,
    position: "absolute",
    top: -2,
    left: 0,
    zIndex: 1,
  },

  overflow: {
    height: 10,
    borderRadius: 5,
    position: "absolute",
    top: -2,
    left: 0,
    zIndex: 2,
  },
});
