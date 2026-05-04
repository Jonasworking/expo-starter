import { Modal, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils/cn";

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      transparent
      visible={visible}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/60 px-8"
        onPress={onCancel}
      >
        {/* Inner Pressable swallows taps so they don't dismiss the dialog. */}
        <Pressable
          className="w-full max-w-sm rounded-[22px] border border-border bg-card p-8"
          onPress={() => {
            // intentional: capture taps inside the card
          }}
        >
          <Text className="text-center font-heading-bold text-[22px] text-foreground">
            {title}
          </Text>
          {description ? (
            <Text className="mt-3 text-center text-[15px] text-muted-foreground leading-relaxed">
              {description}
            </Text>
          ) : null}

          <View className="mt-8 flex-row gap-3">
            <Pressable
              className="h-12 flex-1 items-center justify-center rounded-full border border-border bg-background active:scale-95"
              onPress={onCancel}
            >
              <Text className="font-semibold text-[15px] text-foreground">
                {cancelLabel}
              </Text>
            </Pressable>

            <Pressable
              className={cn(
                "h-12 flex-1 items-center justify-center rounded-full active:scale-95",
                destructive ? "bg-destructive" : "bg-primary"
              )}
              onPress={onConfirm}
            >
              <Text
                className={cn(
                  "font-semibold text-[15px]",
                  destructive
                    ? "text-destructive-foreground"
                    : "text-primary-foreground"
                )}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
