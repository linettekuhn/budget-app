import { Text, VStack } from "@expo/ui/swift-ui";
import { createWidget } from "expo-widgets";

const HelloWidget = () => {
  "widget";

  return (
    <VStack>
      <Text>Hello World</Text>
    </VStack>
  );
};

export default createWidget("HelloWidget", HelloWidget);
