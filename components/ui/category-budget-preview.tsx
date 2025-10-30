import { Colors } from "@/constants/theme";
import { CategorySpend } from "@/types";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
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
  const colorScheme = useColorScheme();

  const bgColor = Colors[colorScheme ?? "light"].background;
  const bgLightColor = Colors[colorScheme ?? "light"].backgroundLight;
  return (
    <Pressable
      key={category.id}
      style={[
        styles.category,
        {
          backgroundColor: bgLightColor,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.categoryData}>
        <ThemedText
          type="bodyLarge"
          darkColor={Colors["dark"].background}
          lightColor={Colors["light"].background}
        >
          {category.name
            .split(" ")
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(" ")}
        </ThemedText>
        <ThemedText
          type="body"
          darkColor={Colors["dark"].background}
          lightColor={Colors["light"].background}
        >
          $ {category.totalSpent} / $ {category.budget}
        </ThemedText>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.backBar, { backgroundColor: bgColor }]} />
        <View
          style={[
            styles.frontBar,
            {
              backgroundColor: category.color,
              width: `${spent * 100}%`,
            },
          ]}
        />
        <View
          style={[
            styles.overflow,
            {
              backgroundColor: "red",
              width: `${overflow * 100}%`,
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  category: {
    borderRadius: 25,
    justifyContent: "center",
    paddingVertical: 15,
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
    height: 4,
    width: "100%",
    borderRadius: 2,
  },

  frontBar: {
    height: 10,
    borderRadius: 5,
    position: "absolute",
    top: -3,
    left: 0,
    zIndex: 1,
  },

  overflow: {
    height: 10,
    borderRadius: 5,
    position: "absolute",
    top: -3,
    left: 0,
    zIndex: 2,
  },
});
