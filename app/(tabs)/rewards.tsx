import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Pressable,
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
import { ThemedText } from "@/components/themed-text";
import { useBadges } from "@/hooks/useBadges";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

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
  };

  const { badges, loading, reload } = useBadges();

  // check unlocked badges when user focuses tab
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.main}>
          <ThemedView
            style={[
              {
                backgroundColor: Colors[colorScheme ?? "light"].primary[200],
                gap: 12,
                borderRadius: 24,
                paddingVertical: 16,
              },
            ]}
          >
            <ThemedText type="displayMedium">Badges</ThemedText>
            <View style={styles.badgesWrapper}>
              {badges.map((badge) =>
                badge.unlocked ? (
                  <Pressable style={styles.badge} key={badge.key}>
                    <Image
                      resizeMode="contain"
                      style={styles.badgeIcon}
                      source={iconMap[badge.key]}
                    />
                  </Pressable>
                ) : (
                  <View style={styles.badge} key={badge.key}>
                    <Image
                      resizeMode="contain"
                      style={styles.badgeIcon}
                      source={LockedIcon}
                    />
                  </View>
                )
              )}
            </View>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
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
    gap: 30,
  },

  badgesWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },

  badge: {
    flexBasis: "29.33%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeIcon: {
    height: "100%",
  },
});
