import { ComponentType, PropsWithChildren, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Octicons from "@expo/vector-icons/Octicons";

type Props = {
  title: string;
  IconComponent?: ComponentType<any>;
  iconName?: string;
};

export function Collapsible({
  children,
  title,
  IconComponent,
  iconName,
}: PropsWithChildren & Props) {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"].text;

  return (
    <View
      style={{
        backgroundColor: Colors[colorScheme ?? "light"].primary[200],
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
      }}
    >
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 24,
            alignItems: "center",
          }}
        >
          {IconComponent && iconName && (
            <IconComponent name={iconName} size={17} color={color} />
          )}
          <ThemedText type="bodyLarge" style={{ color: color }}>
            {title}
          </ThemedText>
        </View>
        <Octicons
          name={isOpen ? "chevron-down" : "chevron-right"}
          size={17}
          color={color}
        />
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "space-between",
  },
  content: {
    marginTop: 4,
    marginHorizontal: 2,
  },
});
