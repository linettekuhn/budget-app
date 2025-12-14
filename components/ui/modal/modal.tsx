import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import Modal from "react-native-modal";
type Props = {
  onClose: () => void;
  visible: boolean;
  children: React.ReactNode;
};

const { width, height } = Dimensions.get("window");

export default function AppModal({ onClose, visible, children }: Props) {
  const colorScheme = useColorScheme();
  return (
    <Modal
      isVisible={visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      backdropOpacity={0.5}
      style={styles.modalContainer}
      backdropColor={Colors[colorScheme ?? "light"].primary[300]}
      avoidKeyboard={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        {/* backdrop */}
        <Pressable onPress={onClose} style={styles.backdrop} />
        {/* modal content */}
        <View
          style={{
            maxHeight: height * 0.85,
            justifyContent: "flex-end",
          }}
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
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    margin: 0,
  },

  keyboardContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  backdrop: {
    flex: 1,
    width: "100%",
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
