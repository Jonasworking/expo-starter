import { router } from "expo-router";
import { Pressable, Text as RNText } from "react-native";
import { Text } from "@/components/ui/text";

const EMOJI_RE = /\p{Extended_Pictographic}/u;

function getAvatarChar(name: string): { char: string; isEmoji: boolean } {
  const trimmed = name.trim();
  const first = Array.from(trimmed)[0];
  if (!first) {
    return { char: "?", isEmoji: false };
  }
  return { char: first, isEmoji: EMOJI_RE.test(first) };
}

export function HeaderAvatar({ name }: { name: string }) {
  const { char, isEmoji } = getAvatarChar(name);
  return (
    <Pressable
      className="size-12 items-center justify-center rounded-full bg-primary active:scale-95"
      hitSlop={8}
      onPress={() => router.push("/settings")}
    >
      {isEmoji ? (
        // Plain RN Text bypasses the Uniwind font assignment so the
        // emoji glyph resolves via the platform's default font; Inter
        // doesn't ship emoji and would render as a missing-glyph box.
        <RNText style={{ fontSize: 22 }}>{char}</RNText>
      ) : (
        <Text className="font-bold text-[18px] text-primary-foreground">
          {char.toUpperCase()}
        </Text>
      )}
    </Pressable>
  );
}
