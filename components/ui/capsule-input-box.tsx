import { Colors } from "@/constants/theme";
import { ComponentType, ReactNode } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  useColorScheme,
  View,
} from "react-native";

type Props = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
  textColor?: string;
  placeholder?: string;
  IconComponent?: ComponentType<any>;
  iconName?: string;
  children?: ReactNode;
};

export default function CapsuleInput({
  value,
  onChangeText,
  textColor,
  placeholder,
  IconComponent,
  iconName,
  children,
  ...rest
}: Props) {
  const colorScheme = useColorScheme();
  const bgDefault = Colors[colorScheme ?? "light"].primary[300];
  const color = Colors[colorScheme ?? "light"].text;

  return (
    <View style={[styles.inputContainer, { backgroundColor: bgDefault }]}>
      {IconComponent && iconName && (
        <IconComponent name={iconName} size={17} color={color + "88"} />
      )}
      <TextInput
        style={[styles.textInput, { color: textColor ?? color }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={color + "88"}
        {...rest}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
  },
});
