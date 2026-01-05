import { Colors } from "@/constants/theme";
import Octicons from "@expo/vector-icons/Octicons";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import FloatingIconButton from "./floating-action-button";

export default function NewTransactionButton({
  focused,
}: {
  focused: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const isExpanded = useSharedValue(false);

  const isTransactionScreen = pathname === "/transaction";

  const animatedStyle = useAnimatedStyle(() => {
    const rotateValue = isExpanded.value ? "45deg" : "0deg";
    return { transform: [{ rotate: withTiming(rotateValue) }] };
  });

  const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value;
  };

  const handleIncomePress = () => {
    isExpanded.value = false;
    router.push({
      pathname: "/(tabs)/transaction",
      params: { type: "INCOME", reset: Date.now().toString() },
    });
  };
  const handleExpensePress = () => {
    isExpanded.value = false;
    router.push({
      pathname: "/(tabs)/transaction",
      params: { type: "EXPENSE", reset: Date.now().toString() },
    });
  };

  return (
    <View>
      {!isTransactionScreen && (
        <>
          <FloatingIconButton
            isExpanded={isExpanded}
            index={0}
            bgColor="#2EA64E"
            IconComponent={Octicons}
            iconName="arrow-up"
            onPress={handleIncomePress}
          />
          <FloatingIconButton
            isExpanded={isExpanded}
            index={1}
            bgColor="#CF3D3D"
            IconComponent={Octicons}
            iconName="arrow-down"
            onPress={handleExpensePress}
          />
        </>
      )}

      <Pressable
        style={[
          styles.transactionBtn,
          {
            backgroundColor: isTransactionScreen
              ? Colors[colorScheme ?? "light"].secondary[500]
              : Colors[colorScheme ?? "light"].primary[500],
          },
        ]}
        onPress={isTransactionScreen ? null : toggleExpanded}
        onPressIn={() => {
          if (process.env.EXPO_OS === "ios") {
            // Add a soft haptic feedback when pressing down on the tabs.
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
      >
        <Animated.Text style={animatedStyle}>
          <Octicons
            name="plus"
            size={25}
            color={Colors[colorScheme ?? "light"].tabBackground}
          />
        </Animated.Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  transactionBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
  },
});
