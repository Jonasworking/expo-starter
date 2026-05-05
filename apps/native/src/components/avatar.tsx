import { Text as RNText, View } from "react-native";
import { Text } from "@/components/ui/text";

const EMOJI_RE = /\p{Extended_Pictographic}/u;

function getAvatarChar(name: string): { char: string; isEmoji: boolean } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { char: "?", isEmoji: false };
  }
  // Iterate code-point segments and pick the first that contains a pictograph,
  // otherwise fall back to the first character. This handles names like
  // "🐺 Wolfgang" (emoji first) and "Wolfgang 🐺" (letters first) — and ZWJ
  // emoji sequences are kept intact via the segment, not split mid-grapheme.
  const segments = Array.from(trimmed);
  for (const seg of segments) {
    if (EMOJI_RE.test(seg)) {
      return { char: seg, isEmoji: true };
    }
  }
  return { char: segments[0], isEmoji: false };
}

interface AvatarProps {
  name: string;
  size: number;
  /** Override for the letter glyph; defaults to ~40% of size. */
  letterFontSize?: number;
  /** Override for the emoji glyph; defaults to ~55% of size. */
  emojiFontSize?: number;
}

export function Avatar({
  name,
  size,
  letterFontSize,
  emojiFontSize,
}: AvatarProps) {
  const { char, isEmoji } = getAvatarChar(name);
  return (
    <View
      className="items-center justify-center rounded-full bg-primary"
      style={{ width: size, height: size }}
    >
      {isEmoji ? (
        // Plain RN Text bypasses the Uniwind font assignment so the emoji
        // glyph resolves via the platform's default font; Inter doesn't
        // ship emoji and would render as a missing-glyph box.
        <RNText style={{ fontSize: emojiFontSize ?? Math.round(size * 0.55) }}>
          {char}
        </RNText>
      ) : (
        <Text
          className="font-bold text-primary-foreground"
          style={{ fontSize: letterFontSize ?? Math.round(size * 0.4) }}
        >
          {char.toUpperCase()}
        </Text>
      )}
    </View>
  );
}
