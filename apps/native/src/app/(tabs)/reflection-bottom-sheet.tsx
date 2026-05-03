import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { ArrowLeftIcon } from "@/components/icons/ph/arrow-left";
import { ArrowUpBoldIcon } from "@/components/icons/ph/arrow-up-bold";
import { XIcon } from "@/components/icons/ph/x";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Text } from "@/components/ui/text";
import { useAppState } from "@/contexts/app-state-context";
import { useThemeColor } from "@/lib/theme/use-theme-color";

const REFLECTION_QUESTION = "What is within your control today?";

const ReflectionBottomSheet = forwardRef<BottomSheetModal>(
  function ReflectionBottomSheet(_props, ref) {
    const [text, setText] = useState("");
    const { completeReflection } = useAppState();
    const [foreground, mutedForeground] = useThemeColor([
      "foreground",
      "muted-foreground",
    ]);

    const handleClose = useCallback(() => {
      if (ref && "current" in ref) {
        ref.current?.dismiss();
      }
    }, [ref]);

    const handleSubmit = useCallback(() => {
      if (text.trim().length === 0) {
        return;
      }
      completeReflection(text.trim());
      setText("");
      handleClose();
    }, [text, completeReflection, handleClose]);

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
          <Text className="mb-6 font-serif text-[36px] text-foreground leading-tight">
            {REFLECTION_QUESTION}
          </Text>

          <BottomSheetTextInput
            autoFocus
            multiline
            onChangeText={setText}
            placeholder="Write your reflection..."
            placeholderTextColor={mutedForeground}
            style={{
              fontSize: 18,
              color: foreground,
              fontFamily: "Inter_400Regular",
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
  }
);

export { ReflectionBottomSheet };
