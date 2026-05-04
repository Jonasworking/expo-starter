import { router } from "expo-router";
import { Pressable } from "react-native";
import { Avatar } from "@/components/avatar";

export function HeaderAvatar({ name }: { name: string }) {
  return (
    <Pressable
      className="rounded-full active:scale-95"
      hitSlop={8}
      onPress={() => router.push("/settings")}
    >
      <Avatar emojiFontSize={22} letterFontSize={18} name={name} size={48} />
    </Pressable>
  );
}
