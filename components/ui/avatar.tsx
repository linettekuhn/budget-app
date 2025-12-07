import { notionistsNeutral } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { useMemo } from "react";
import { View } from "react-native";
import { SvgXml } from "react-native-svg";

type Props = {
  name: string;
  size?: number;
};

export default function Avatar({ name, size }: Props) {
  const avatar = useMemo(() => {
    return createAvatar(notionistsNeutral, {
      seed: name,
      size: size,
      radius: 50,
      backgroundColor: ["f79cd1", "ae8fba", "d1d4f9", "ffdfbf", "b6e3f4"],
      backgroundType: ["gradientLinear"],
      backgroundRotation: [0, 360],
    }).toString();
  }, [name, size]);

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <SvgXml xml={avatar} width={size} height={size} />
    </View>
  );
}
