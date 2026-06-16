import { ThemedText } from "@/components/themed-text";
import { Colors, getTheme } from "@/constants/theme";
import { useCategories } from "@/hooks/useCategories";
import { useModal } from "@/hooks/useModal";
import DatabaseService from "@/services/DatabaseService";
import WidgetService from "@/services/WidgetService";
import { CategoryType } from "@/types";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import SettingsModal from "../ui/modal/settings-modal";
import ProfileOption from "./profile-option";

function WidgetCategoryContent({
  initialCategoryId,
  categories,
  onSave,
  onCancel,
}: {
  initialCategoryId: string | null;
  categories: CategoryType[];
  onSave: (categoryId: string) => Promise<void>;
  onCancel: () => void;
}) {
  const colorScheme = useColorScheme();
  const c = Colors[getTheme(colorScheme)];
  const [pendingId, setPendingId] = useState<string | null>(initialCategoryId);

  return (
    <SettingsModal
      title="Widget Category"
      onComplete={async () => {
        if (pendingId) await onSave(pendingId);
      }}
      onCancel={onCancel}
    >
      <ThemedText type="h5">
        Choose which category to display in your Category Budget widget.
      </ThemedText>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {categories.map((cat: CategoryType) => {
          const isSelected = pendingId === cat.id;
          return (
            <Pressable
              key={cat.id}
              style={[
                styles.categoryRow,
                {
                  backgroundColor: isSelected ? c.primary[200] : "transparent",
                  borderColor: c.primary[300],
                },
              ]}
              onPress={() => setPendingId(cat.id)}
            >
              <View style={[styles.dot, { backgroundColor: cat.color }]} />
              <ThemedText type="body">
                {cat.name
                  .split(" ")
                  .map((w) => w[0].toUpperCase() + w.slice(1))
                  .join(" ")}
              </ThemedText>
              {isSelected && (
                <ThemedText
                  type="body"
                  style={[styles.checkmark, { color: c.primary[500] }]}
                >
                  ✓
                </ThemedText>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </SettingsModal>
  );
}

export default function WidgetCategoryOption() {
  const { openModal, closeModal } = useModal();
  const { categories } = useCategories();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    DatabaseService.getWidgetCategoryId().then((id) => {
      if (id) setSelectedId(id);
    });
  }, []);

  const selectedCategory = categories.find((cat) => cat.id === selectedId);

  const handleOpen = () => {
    openModal(
      <WidgetCategoryContent
        initialCategoryId={selectedId}
        categories={categories}
        onSave={async (categoryId: string) => {
          await DatabaseService.setWidgetCategoryId(categoryId);
          await WidgetService.syncCategoryWidget();
          setSelectedId(categoryId);
          closeModal();
        }}
        onCancel={closeModal}
      />,
    );
  };

  const label = selectedCategory
    ? selectedCategory.name
        .split(" ")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ")
    : "Not set";

  return (
    <ProfileOption text="Widget Category" onPress={handleOpen}>
      <View style={styles.valueRow}>
        {selectedCategory && (
          <View
            style={[styles.dot, { backgroundColor: selectedCategory.color }]}
          />
        )}
        <ThemedText type="captionSmall">{label}</ThemedText>
      </View>
    </ProfileOption>
  );
}

const styles = StyleSheet.create({
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  list: {
    maxHeight: 300,
    marginTop: 8,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  checkmark: {
    marginLeft: "auto",
  },
});
