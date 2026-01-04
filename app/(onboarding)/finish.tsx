import { useOnboarding } from "@/components/context/onboarding-provider";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import AnimatedScreen from "@/components/ui/animated-screen";
import CapsuleButton from "@/components/ui/capsule-button";
import OnboardingControls from "@/components/ui/onboarding-controls";
import { Colors } from "@/constants/theme";
import DatabaseService from "@/services/DatabaseService";
import SyncService from "@/services/SyncService";
import Octicons from "@expo/vector-icons/Octicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function FinishOnboarding() {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].secondary[500];
  const router = useRouter();

  // get onboarding state's budgets
  const { state, reset } = useOnboarding();
  const { name, categories, budgets, salary } = state;
  const total = Object.values(state.budgets).reduce((sum, { raw }) => {
    const value = parseFloat((Number(raw) / 100).toFixed(2));
    return sum + value;
  }, 0);

  const handleCompleteOnboarding = async () => {
    try {
      // save name
      await DatabaseService.insertName(name);

      // save categories
      await DatabaseService.clearCategories();
      await DatabaseService.insertCategories(categories, budgets);

      // save salary
      await DatabaseService.saveSalary(
        salary.type,
        salary.amount,
        salary.monthly,
        salary.hoursPerWeek
      );

      // mark onboarding as completed
      await AsyncStorage.setItem("completedOnboarding", "true");

      // reset onboarding state
      reset();

      // sync changes after onboarding
      await SyncService.sync();

      // access app
      router.replace("/(tabs)");
    } catch (error: unknown) {
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error ocurred while completing onboarding",
        });
      }
    }
  };

  return (
    <AnimatedScreen>
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: Colors[colorScheme ?? "light"].background },
        ]}
      >
        <OnboardingControls />
        <ScrollView contentContainerStyle={styles.container}>
          <ThemedView style={styles.main}>
            <ThemedText type="displayMedium">
              You&apos;re All Set {name}!
            </ThemedText>
            <ThemedText type="h4">Here&apos;s a quick recap:</ThemedText>
            <ThemedView style={styles.recap}>
              <View>
                <ThemedText type="h3">Category Budgets</ThemedText>
                {categories.map((cat) => {
                  const amount = budgets[cat.id]?.display ?? "0.00";
                  return (
                    <ThemedText type="h6" key={cat.id}>
                      <Octicons name="dot-fill" color={cat.color} size={20} />{" "}
                      {cat.name} - ${amount}
                    </ThemedText>
                  );
                })}
              </View>
              <View>
                <ThemedText type="h3">Monthly Summary</ThemedText>
                <ThemedText type="h6">Budget: ${total.toFixed(2)}</ThemedText>
                <ThemedText type="h6">
                  Salary: ${salary.monthly.toFixed(2)}
                </ThemedText>
              </View>
            </ThemedView>
            {total > salary.monthly && (
              <View>
                <ThemedText
                  type="overline"
                  style={{
                    color: Colors[colorScheme ?? "light"].error,
                    textAlign: "center",
                  }}
                >
                  This budget exceeds your current salary!
                </ThemedText>
                <ThemedText
                  type="captionSmall"
                  style={{
                    color: Colors[colorScheme ?? "light"].error,
                    textAlign: "center",
                  }}
                >
                  Consider adjusting your budgets or salary to start saving.
                </ThemedText>
              </View>
            )}
            <ThemedText type="h4">
              You can now start tracking your spending and building better money
              habits!
            </ThemedText>
            <CapsuleButton
              text="See Dashboard"
              iconName="arrow-right"
              IconComponent={Octicons}
              bgFocused={btnColor}
              onPress={handleCompleteOnboarding}
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
    gap: 20,
  },

  horizontalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
  },

  categoryBudget: {
    flexDirection: "row",
  },

  recap: {
    gap: 16,
  },
});
