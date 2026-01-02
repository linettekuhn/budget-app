import { ThemedView } from "@/components/themed-view";
import { Motion } from "@/constants/motion";
import { Colors } from "@/constants/theme";
import { useEffect, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
type Props = {
  onClose: () => void;
  visible: boolean;
  children: React.ReactNode;
};

const { width, height } = Dimensions.get("window");

export default function AppModal({ onClose, visible, children }: Props) {
  const colorScheme = useColorScheme();

  const [isModalMounted, setIsModalMounted] = useState(visible);

  const opacity = useSharedValue(Motion.opacity.hidden);
  const translateY = useSharedValue(height);

  const handleUnmount = () => {
    setIsModalMounted(false);
  };

  useEffect(() => {
    if (visible) {
      // mount modal
      setIsModalMounted(true);
      // entry animation
      opacity.value = withTiming(Motion.opacity.backdrop, {
        duration: Motion.duration.slow,
      });
      translateY.value = withTiming(0, {
        duration: Motion.duration.normal,
      });
    } else if (isModalMounted) {
      // exit animation
      opacity.value = withTiming(Motion.opacity.hidden, {
        duration: Motion.duration.slow,
      });
      translateY.value = withTiming(
        height,
        {
          duration: Motion.duration.normal,
        },
        // THEN unmount modal (bridge from UI thread to JS thread)
        (finished) => {
          if (finished) {
            scheduleOnRN(handleUnmount);
          }
        }
      );
    }
  }, [visible, opacity, translateY, isModalMounted]);

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!isModalMounted) return null;

  return (
    <Modal
      visible={isModalMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        {/* backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            animatedBackdropStyle,
            { backgroundColor: Colors[colorScheme ?? "light"].primary[300] },
          ]}
        >
          <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        </Animated.View>

        {/* modal content */}
        <Animated.View
          style={[
            {
              maxHeight: height * 0.85,
              width: "100%",
              justifyContent: "flex-end",
            },
            animatedContentStyle,
          ]}
        >
          <ThemedView style={styles.contentWrapper}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {children}
            </ScrollView>
          </ThemedView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  contentWrapper: {
    width: width,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  scrollContent: {
    paddingTop: 16,
    paddingBottom: 44,
  },
});
