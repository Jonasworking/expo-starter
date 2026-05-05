import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { ArrowLeftIcon } from "@/components/icons/ph/arrow-left";
import { ArrowUpBoldIcon } from "@/components/icons/ph/arrow-up-bold";
import { XIcon } from "@/components/icons/ph/x";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Text } from "@/components/ui/text";
import { type ReflectionKind, useAppState } from "@/contexts/app-state-context";
import { useThemeColor } from "@/lib/theme/use-theme-color";

const PROMPTS: Record<ReflectionKind, string> = {
  morning: "What is within your control today?",
  evening: "What did you do well today?",
};

interface ReflectionBottomSheetProps {
  mode?: "create" | "edit";
  kind?: ReflectionKind;
  initialText?: string;
  editDateKey?: string;
}

const ReflectionBottomSheet = forwardRef<
  BottomSheetModal,
  ReflectionBottomSheetProps
>(function ReflectionBottomSheet(
  { mode = "create", kind = "morning", initialText = "", editDateKey },
  ref
) {
  const [text, setText] = useState(initialText);
  const { completeReflection, completeEveningReflection, editReflection } =
    useAppState();
  const [foreground, mutedForeground] = useThemeColor([
    "foreground",
    "muted-foreground",
  ]);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleClose = useCallback(() => {
    if (ref && "current" in ref) {
      ref.current?.dismiss();
    }
  }, [ref]);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return;
    }
    if (mode === "edit" && editDateKey) {
      editReflection(editDateKey, trimmed, kind);
    } else if (kind === "evening") {
      completeEveningReflection(trimmed);
    } else {
      completeReflection(trimmed);
    }
    setText("");
    handleClose();
  }, [
    text,
    mode,
    kind,
    editDateKey,
    completeReflection,
    completeEveningReflection,
    editReflection,
    handleClose,
  ]);

  return (
    <BottomSheet enableDynamicSizing={false} ref={ref} snapPoints={["85%"]}>
      {/* Drag handle */}
      <View className="items-center pt-1 pb-2">
        <View className="h-1 w-12 rounded-full bg-border" />
      </View>

      {/* Header row */}
      <View className="h-12 flex-row items-center justify-between px-8">
        <Pressable className="-ml-2 p-2" hitSlop={8} onPress={handleClose}>
          <ArrowLeftIcon className="size-6 text-foreground" />
        </Pressable>
        <Pressable className="-mr-2 p-2" hitSlop={8} onPress={handleClose}>
          <XIcon className="size-6 text-foreground" />
        </Pressable>
      </View>

      {/* Content */}
      <View className="flex-1 px-8 pt-4">
        <Text className="mb-6 font-heading-bold text-[28px] text-foreground leading-tight">
          {PROMPTS[kind]}
        </Text>

        <BottomSheetTextInput
          autoFocus
          multiline
          onChangeText={setText}
          placeholder="Write your reflection..."
          placeholderTextColor={mutedForeground}
          style={{
            fontSize: 18,
            lineHeight: 26,
            color: foreground,
            fontFamily: "Inter_400Regular",
            fontWeight: "400",
            fontStyle: "normal",
            minHeight: 200,
            padding: 0,
            textAlignVertical: "top",
          }}
          value={text}
        />
      </View>

      {/* Floating submit button */}
      <View className="absolute right-8 bottom-10">
        <Pressable
          className="size-14 items-center justify-center rounded-full bg-primary shadow-lg active:scale-95"
          onPress={handleSubmit}
        >
          <ArrowUpBoldIcon className="size-6 text-primary-foreground" />
        </Pressable>
      </View>
    </BottomSheet>
  );
});

export { ReflectionBottomSheet };
