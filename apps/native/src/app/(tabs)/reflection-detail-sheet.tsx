import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, useCallback } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { TrashBoldIcon } from "@/components/icons/ph/trash-bold";
import { XIcon } from "@/components/icons/ph/x";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Text } from "@/components/ui/text";

interface ReflectionDetailSheetProps {
  dateLabel: string;
  text: string;
  onEdit: () => void;
  onDelete: () => void;
}

const ReflectionDetailSheet = forwardRef<
  BottomSheetModal,
  ReflectionDetailSheetProps
>(function ReflectionDetailSheet({ dateLabel, text, onEdit, onDelete }, ref) {
  const handleClose = useCallback(() => {
    if (ref && "current" in ref) {
      ref.current?.dismiss();
    }
  }, [ref]);

  return (
    <BottomSheet enableDynamicSizing={false} ref={ref} snapPoints={["70%"]}>
      <View className="items-center pt-1 pb-2">
        <View className="h-1 w-12 rounded-full bg-border" />
      </View>

      <View className="h-12 flex-row items-center justify-between px-8">
        <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
          {dateLabel}
        </Text>
        <Pressable className="-mr-2 p-2" hitSlop={8} onPress={handleClose}>
          <XIcon className="size-6 text-foreground" />
        </Pressable>
      </View>

      <ScrollView
        className="px-8"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-serif text-[24px] text-foreground leading-relaxed">
          {text}
        </Text>
      </ScrollView>

      <View className="flex-row gap-3 px-8 pt-2 pb-2">
        <Pressable
          className="h-12 flex-1 items-center justify-center rounded-full border border-border bg-card active:scale-95"
          onPress={onDelete}
        >
          <View className="flex-row items-center gap-2">
            <TrashBoldIcon className="size-4 text-destructive" />
            <Text className="font-semibold text-[15px] text-destructive">
              Delete
            </Text>
          </View>
        </Pressable>
        <Pressable
          className="h-12 flex-[2] items-center justify-center rounded-full bg-primary active:scale-95"
          onPress={onEdit}
        >
          <Text className="font-semibold text-[15px] text-primary-foreground">
            Edit
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
});

export { ReflectionDetailSheet };
