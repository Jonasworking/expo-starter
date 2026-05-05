import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, useCallback } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { PencilSimpleBoldIcon } from "@/components/icons/ph/pencil-simple-bold";
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

      {/* Header: date left, edit + close right with breathing room */}
      <View className="h-12 flex-row items-center justify-between px-8">
        <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
          {dateLabel}
        </Text>
        <View className="flex-row items-center gap-2">
          <Pressable
            className="size-11 items-center justify-center rounded-full active:opacity-60"
            hitSlop={6}
            onPress={onEdit}
          >
            <PencilSimpleBoldIcon className="size-5 text-foreground" />
          </Pressable>
          <Pressable
            className="-mr-2 size-11 items-center justify-center rounded-full active:opacity-60"
            hitSlop={6}
            onPress={handleClose}
          >
            <XIcon className="size-6 text-foreground" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="px-8"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-medium text-[18px] text-foreground leading-relaxed">
          {text}
        </Text>
      </ScrollView>

      {/* Footer: single full-width destructive Delete */}
      <View className="px-8 pt-2 pb-2">
        <Pressable
          className="h-14 w-full flex-row items-center justify-center gap-2 rounded-full bg-destructive active:scale-95"
          onPress={onDelete}
        >
          <TrashBoldIcon className="size-5 text-destructive-foreground" />
          <Text className="font-semibold text-[16px] text-destructive-foreground">
            Delete
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
});

export { ReflectionDetailSheet };
