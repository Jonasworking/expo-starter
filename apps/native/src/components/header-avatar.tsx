import { router } from "expo-router";
import { Pressable } from "react-native";
import { Avatar } from "@/components/avatar";

interface HeaderAvatarProps {
  name: string;
  size?: number;
}

export function HeaderAvatar({ name, size = 48 }: HeaderAvatarProps) {
  const letterFontSize = Math.round(size * 0.4);
  const emojiFontSize = Math.round(size * 0.55);
  return (
    <Pressable
      className="rounded-full active:scale-95"
      hitSlop={8}
      onPress={() => router.push("/settings")}
    >
      <Avatar
        emojiFontSize={emojiFontSize}
        letterFontSize={letterFontSize}
        name={name}
        size={size}
      />
    </Pressable>
  );
}
