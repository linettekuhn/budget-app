import { ThemedView } from "@/components/themed-view";
import { Dimensions, Pressable, ScrollView, StyleSheet } from "react-native";
import Modal from "react-native-modal";
type Props = {
  onClose: () => void;
  visible: boolean;
  children: React.ReactNode;
};

const { width, height } = Dimensions.get("window");

export default function AppModal({ onClose, visible, children }: Props) {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      backdropOpacity={0.5}
      style={styles.modalContainer}
    >
      <Pressable
        onPress={(e) => e.stopPropagation()}
        style={{ maxHeight: height * 0.85 }}
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
      </Pressable>
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
