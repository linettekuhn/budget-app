import { Motion } from "@/constants/motion";
import { BadgeType } from "@/types";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  onPress: () => void;
  badge: BadgeType;
  iconMap: Record<string, ImageSourcePropType>;
};

export default function BadgeButton({ onPress, badge, iconMap }: Props) {
  const scale = useSharedValue(Motion.scale.default);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return badge.unlocked ? (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={styles.badge}
        key={badge.id}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(Motion.scale.press, {
            duration: Motion.duration.fast,
          });
        }}
        onPressOut={() => {
          scale.value = withTiming(Motion.scale.default, {
            duration: Motion.duration.fast,
          });
        }}
      >
        <Image
          resizeMode="contain"
          style={styles.badgeIcon}
          source={iconMap[badge.id]}
        />
      </Pressable>
    </Animated.View>
  ) : (
    <View style={styles.badge} key={badge.id}>
      <Image
        resizeMode="contain"
        style={styles.badgeIcon}
        source={iconMap["locked"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexBasis: "29.33%",
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeIcon: {
    height: "100%",
    width: "100%",
  },
});
