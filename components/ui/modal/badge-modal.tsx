import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BadgeType } from "@/types";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
export default function BadgeModal({
  badge,
  icon,
}: {
  badge: BadgeType;
  icon: ImageSourcePropType;
}) {
  return (
    <ThemedView style={styles.badgeInfoWrapper}>
      <Image resizeMode="contain" style={styles.badgeIcon} source={icon} />
      <ThemedText type="h3">{badge.description}</ThemedText>
      <ThemedText type="bodyLarge">
        Earned on {badge.unlocked_at.toLocaleDateString()}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  badgeInfoWrapper: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  badgeIcon: {
    height: 240,
  },
});
