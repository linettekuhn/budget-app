import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CheapLifeIcon from "@/assets/icons/badges/Cheap_Life_Icon.png";
import CustomCategoryIcon from "@/assets/icons/badges/Custom_Category_Icon.png";
import ExpertPlannerIcon from "@/assets/icons/badges/Expert_Planner_Icon.png";
import FirstTransactionIcon from "@/assets/icons/badges/First_Transaction_Icon.png";
import LockedIcon from "@/assets/icons/badges/Locked_Icon.png";
import MinimalistIcon from "@/assets/icons/badges/Minimalist_Icon.png";
import NoOverspendingIcon from "@/assets/icons/badges/No_Overspending_Icon.png";
import PerfectionistIcon from "@/assets/icons/badges/Perfectionist_Icon.png";
import RestaurantsTopIcon from "@/assets/icons/badges/Restaurants_Top_Icon.png";
import ShopaholicIcon from "@/assets/icons/badges/Shopaholic_Icon.png";
import SmartSpenderIcon from "@/assets/icons/badges/Smart_Spender_Icon.png";
import SteadyPlannerIcon from "@/assets/icons/badges/Steady_Planner_Icon.png";
import FireStreakIcon from "@/assets/icons/streak_icon.png";
import { ThemedText } from "@/components/themed-text";
import AnimatedScreen from "@/components/ui/animated-screen";
import BadgeButton from "@/components/ui/badge-button";
import BadgeModal from "@/components/ui/modal/badge-modal";
import AppModal from "@/components/ui/modal/modal";
import { useBadges } from "@/hooks/useBadges";
import { useStreak } from "@/hooks/useStreak";
import { BadgeType } from "@/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import Svg, { Text } from "react-native-svg";

export default function Rewards() {
  const colorScheme = useColorScheme();
  const bgColor = Colors[colorScheme ?? "light"].background;

  const iconMap: Record<string, ImageSourcePropType> = {
    first_transaction: FirstTransactionIcon,
    under_control: NoOverspendingIcon,
    cheap_life: CheapLifeIcon,
    shopaholic: ShopaholicIcon,
    custom_category: CustomCategoryIcon,
    steady_planner: SteadyPlannerIcon,
    expert_planner: ExpertPlannerIcon,
    restaurant_top: RestaurantsTopIcon,
    smart_spender: SmartSpenderIcon,
    perfectionist: PerfectionistIcon,
    minimalist: MinimalistIcon,
    locked: LockedIcon,
  };

  const { badges, loading: loadingBadges, reload: reloadBadges } = useBadges();
  const {
    currentStreak,
    loading: loadingStreak,
    reload: reloadStreak,
  } = useStreak();
  const [showBadgeInfo, setShowBadgeInfo] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

  // check unlocked badges when user focuses tab
  useFocusEffect(
    useCallback(() => {
      reloadBadges();
      reloadStreak();
    }, [reloadBadges, reloadStreak])
  );

  const openBadgeModal = (badge: BadgeType) => {
    setSelectedBadge(badge);
    setShowBadgeInfo(true);
  };

  const closeBadgeModal = () => {
    setShowBadgeInfo(false);
    setSelectedBadge(null);
  };

  const calculateStreakFontSize = (streak: number) => {
    const digits = String(streak).length;

    if (digits <= 2) {
      return 60;
    } else if (digits === 3) {
      return 48;
    } else if (digits === 4) {
      return 40;
    }
    return 32;
  };
  const streakFontSize = calculateStreakFontSize(currentStreak);

  return (
    <AnimatedScreen>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <ScrollView contentContainerStyle={styles.container}>
          {!loadingStreak && !loadingBadges && (
            <ThemedView style={styles.main}>
              <ThemedView style={styles.streakHeader}>
                <View style={styles.streakWrapper}>
                  <Image
                    resizeMode="contain"
                    style={[styles.streakIcon, StyleSheet.absoluteFill]}
                    source={FireStreakIcon}
                  />
                  <Svg height={80} width={80} style={[styles.streak]}>
                    <Text
                      fill={"none"}
                      stroke={bgColor}
                      strokeWidth={10}
                      strokeLinejoin="round"
                      fontSize={streakFontSize}
                      fontFamily="Onest-Black"
                      textAnchor="middle"
                      x="50%"
                      y="100%"
                      alignmentBaseline="ideographic"
                    >
                      {String(currentStreak)}
                    </Text>
                    <Text
                      fill={Colors[colorScheme ?? "light"].text}
                      stroke={"none"}
                      fontSize={streakFontSize}
                      fontFamily="Onest-Black"
                      textAnchor="middle"
                      x="50%"
                      y="100%"
                      alignmentBaseline="ideographic"
                    >
                      {String(currentStreak)}
                    </Text>
                  </Svg>
                </View>
                <ThemedText type="h2">Smart Spending Streak</ThemedText>
              </ThemedView>
              <ThemedView
                style={[
                  {
                    backgroundColor:
                      Colors[colorScheme ?? "light"].primary[200],
                    gap: 12,
                    borderRadius: 24,
                    paddingVertical: 8,
                  },
                ]}
              >
                <View style={styles.badgesWrapper}>
                  {badges.map((badge) => (
                    <BadgeButton
                      key={badge.id}
                      badge={badge}
                      onPress={() => openBadgeModal(badge)}
                      iconMap={iconMap}
                    />
                  ))}
                </View>
                {showBadgeInfo && selectedBadge && (
                  <AppModal visible={showBadgeInfo} onClose={closeBadgeModal}>
                    <BadgeModal
                      badge={selectedBadge}
                      icon={iconMap[selectedBadge.id]}
                    />
                  </AppModal>
                )}
              </ThemedView>
            </ThemedView>
          )}
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  main: {
    flex: 1,
    gap: 12,
  },

  streakHeader: {
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },

  streakWrapper: {
    position: "relative",
    height: 100,
    width: 80,
    justifyContent: "flex-start",
  },

  streakIcon: {
    position: "absolute",
    height: 100,
    width: 80,
    top: 0,
    left: 0,
    zIndex: 0,
  },

  streak: {
    zIndex: 1,
    position: "absolute",
    bottom: -20,
  },

  badgesWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
});
