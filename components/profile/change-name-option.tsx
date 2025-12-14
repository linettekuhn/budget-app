import { useModal } from "@/hooks/useModal";
import { useName } from "@/hooks/useName";
import { useState } from "react";
import { Toast } from "toastify-react-native";
import { ThemedText } from "../themed-text";
import CapsuleInput from "../ui/capsule-input-box";
import SettingsModal from "../ui/modal/settings-modal";
import ProfileOption from "./profile-option";

function NameChangeContent({
  initialName,
  onSave,
  onCancel,
}: {
  initialName: string;
  onSave: (name: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [tempName, setTempName] = useState(initialName);

  return (
    <SettingsModal
      onCancel={onCancel}
      title="Change your name"
      onComplete={async () => {
        try {
          if (!tempName) throw new Error("Please enter a name");
          await onSave(tempName.trim());
        } catch (error: unknown) {
          if (error instanceof Error) {
            Toast.show({
              type: "error",
              text1: error.message,
            });
          } else {
            Toast.show({
              type: "error",
              text1: "An error occurred while updating name",
            });
          }
        }
      }}
    >
      <ThemedText type="h3">What should we call you?</ThemedText>
      <CapsuleInput
        value={tempName}
        onChangeText={(text) =>
          setTempName(
            text.trim().charAt(0).toUpperCase() + text.trim().slice(1)
          )
        }
        placeholder="Enter name here"
      />
    </SettingsModal>
  );
}

export default function ChangeNameOption({
  onChange,
}: {
  onChange: () => void;
}) {
  const { openModal, closeModal } = useModal();
  const { name, updateName } = useName();

  const handleNameChange = () => {
    openModal(
      <NameChangeContent
        initialName={name ?? ""}
        onSave={async (newName) => {
          if (newName === name) {
            closeModal();
            return;
          }
          await updateName(newName);
          onChange();
          closeModal();
        }}
        onCancel={closeModal}
      />
    );
  };

  return <ProfileOption text="Change name" onPress={handleNameChange} />;
}
