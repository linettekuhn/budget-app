import { Colors } from "@/constants/theme";
import { thumbs } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { useMemo } from "react";
import { useColorScheme, View } from "react-native";
import { SvgXml } from "react-native-svg";

type Props = {
  name: string;
  size?: number;
};

export default function Avatar({ name, size }: Props) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"].text.slice(1);
  const avatar = useMemo(() => {
    return createAvatar(thumbs, {
      seed: name,
      size: size,
      radius: 50,
      scale: 80,
      backgroundColor: ["f79cd1", "ae8fba", "d1d4f9"],
      backgroundType: ["gradientLinear"],
      backgroundRotation: [0, 360],
      eyes: [
        "variant1W10",
        "variant1W12",
        "variant1W14",
        "variant1W16",
        "variant2W10",
        "variant2W12",
        "variant2W14",
        "variant2W16",
        "variant5W10",
        "variant5W12",
        "variant5W14",
        "variant5W16",
        "variant7W10",
        "variant7W12",
        "variant7W14",
        "variant7W16",
        "variant8W10",
        "variant8W12",
        "variant8W14",
        "variant8W16",
        "variant9W10",
        "variant9W12",
        "variant9W14",
        "variant9W16",
      ],
      eyesColor: [color],
      mouth: ["variant1", "variant2", "variant4"],
      mouthColor: [color],
      face: ["variant1", "variant2", "variant3", "variant4"],
      shapeColor: ["0a5b83", "1c799f", "4c5e91"],
    }).toString();
  }, [name, size, color]);

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <SvgXml xml={avatar} width={size} height={size} />
    </View>
  );
}
