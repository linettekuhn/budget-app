import { ThemedView } from "@/components/themed-view";
import { Modal, Pressable, StyleSheet } from "react-native";

type Props = {
  onClose: () => void;
  visible: boolean;
  children: React.ReactNode;
};

export default function AppModal({ onClose, visible, children }: Props) {
  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.background} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <ThemedView style={styles.contentWrapper}>{children}</ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  contentWrapper: {
    padding: 20,
    borderRadius: 12,
    minWidth: 300,
  },
});
