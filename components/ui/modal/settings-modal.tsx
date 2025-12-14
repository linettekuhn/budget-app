import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { PropsWithChildren } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import CapsuleButton from "../capsule-button";

type Props = {
  onComplete: () => void;
  onCancel: () => void;
  title: string;
};

export default function SettingsModal({
  onComplete,
  onCancel,
  title,
  children,
}: Props & PropsWithChildren) {
  const colorScheme = useColorScheme();
  const btnColor = Colors[colorScheme ?? "light"].primary[500];

  return (
    <ThemedView style={styles.modalContent}>
      <ThemedText style={styles.heading} type="h1">
        {title}
      </ThemedText>
      {children}
      <View style={styles.horizontalContainer}>
        <CapsuleButton text="CANCEL" onPress={onCancel} bgFocused={btnColor} />
        <CapsuleButton
          text="SAVE CHANGES"
          onPress={onComplete}
          bgFocused={btnColor}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 8,
  },

  heading: {
    marginVertical: 10,
    marginHorizontal: "auto",
  },

  options: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    maxWidth: "95%",
  },

  content: {
    alignItems: "center",
    gap: 15,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  colorPicker: {
    gap: 20,
    width: "60%",
  },

  horizontalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "nowrap",
    gap: 10,
  },
});
