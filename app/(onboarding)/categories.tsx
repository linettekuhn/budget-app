import { useOnboarding } from "@/components/context/onboarding-provider";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AnimatedScreen from "@/components/ui/animated-screen";
import CapsuleButton from "@/components/ui/capsule-button";
import CapsuleToggle from "@/components/ui/capsule-toggle";
import CustomCategory from "@/components/ui/modal/category-modal";
import OnboardingControls from "@/components/ui/onboarding-controls";
import { Colors } from "@/constants/theme";
import { useCategories } from "@/hooks/useCategories";
import { useModal } from "@/hooks/useModal";
import { CategoryType } from "@/types";
import adjustColorForScheme from "@/utils/adjustColorForScheme";
import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoriesOnboarding() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];
  const router = useRouter();

  // get onboarding state's categories
  const { state, setState } = useOnboarding();
  const selectedCategories = state.categories;

  const toggleCategory = (category: CategoryType) => {
    setState((prev) => {
      const isSelected = prev.categories.some((cat) => cat.id === category.id);

      let updatedCategories;
      if (isSelected) {
        // remove if selected
        updatedCategories = prev.categories.filter(
          (cat) => cat.id !== category.id
        );
      } else {
        // add if not selected
        updatedCategories = [...prev.categories, category];
      }

      // update state
      return {
        ...prev,
        categories: updatedCategories,
      };
    });
  };

  const saveSelectedCategories = async () => {
    if (!selectedCategories.length) {
      return;
    }

    router.push("/budget");
  };

  const { openModal, closeModal } = useModal();
  const { categories, loading, reload } = useCategories();

  useEffect(() => {
    reload();
  }, [reload]);

  const handleOpen = () => {
    openModal(
      <CustomCategory
        onComplete={() => {
          closeModal();
          reload();
        }}
      />
    );
  };

  if (loading) {
    return (
      <View
        style={{
          backgroundColor: Colors[colorScheme ?? "light"].background,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme ?? "light"].text}
        />
      </View>
    );
  }

  return (
    <AnimatedScreen entering="slideRight">
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: Colors[colorScheme ?? "light"].background },
        ]}
      >
        <OnboardingControls />
        <ScrollView contentContainerStyle={styles.container}>
          <ThemedView style={styles.main}>
            <ThemedText type="h1" style={{ paddingHorizontal: 30 }}>
              Choose or Add Your Categories
            </ThemedText>
            <ThemedText type="h5" style={{ paddingHorizontal: 20 }}>
              We&apos;ve added a few default categories to get you started.
            </ThemedText>
            <ThemedView style={styles.horizontalContainer}>
              {categories.map((category) => {
                const categoryColor = adjustColorForScheme(
                  category.color,
                  colorScheme
                );
                return (
                  <CapsuleToggle
                    key={category.id}
                    text={category.name}
                    bgFocused={categoryColor}
                    selected={selectedCategories.some(
                      (cat) => cat.id === category.id
                    )}
                    onPress={() => toggleCategory(category)}
                  />
                );
              })}
              <CapsuleButton
                onPress={handleOpen}
                text="NEW CATEGORY"
                bgFocused={btnColor}
                IconComponent={Octicons}
                iconName="plus"
              />
            </ThemedView>
            <CapsuleButton
              text="Next"
              iconName="arrow-right"
              IconComponent={Octicons}
              bgFocused={btnColor}
              onPress={saveSelectedCategories}
            />
          </ThemedView>
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
    paddingTop: 70,
  },

  main: {
    paddingVertical: 8,
    flex: 1,
    gap: 30,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  horizontalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },
});
