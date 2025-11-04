import { ThemedView } from "@/components/themed-view";
import { Dimensions, Pressable, StyleSheet } from "react-native";
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
      <Pressable onPress={(e) => e.stopPropagation()}>
        <ThemedView style={styles.contentWrapper}>{children}</ThemedView>
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
    height: height * 0.85,
    width: width,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
});
