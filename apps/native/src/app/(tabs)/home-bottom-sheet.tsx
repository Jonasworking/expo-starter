import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import RNSlider from "@react-native-community/slider";
import { forwardRef, useCallback, useState } from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";
import { BoltBoldIcon } from "@/components/icons/solar/bolt-bold";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/lib/theme/use-theme-color";

const Slider = withUniwind(RNSlider);

const HomeBottomSheet = forwardRef<BottomSheetModal>(
  function HomeBottomSheet(_props, ref) {
    const [value, setValue] = useState(50);
    const [primary, muted] = useThemeColor(["primary", "muted"]);

    const handleClose = useCallback(() => {
      if (ref && "current" in ref) {
        ref.current?.dismiss();
      }
    }, [ref]);

    return (
      <BottomSheet ref={ref}>
        <View className="items-center px-6 py-4">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-lg bg-accent">
            <BoltBoldIcon className="size-6 text-foreground" />
          </View>
          <Text className="mb-1 font-medium text-foreground text-lg">
            Bottom Sheet
          </Text>
          <Text className="mb-4 text-center text-muted-foreground text-sm">
            Drag the slider to change the value.
          </Text>
          <Text className="mb-2 font-bold text-4xl text-primary">{value}</Text>
          <Slider
            className="mb-6 h-10 w-full"
            maximumTrackTintColor={muted}
            maximumValue={100}
            minimumTrackTintColor={primary}
            minimumValue={0}
            onValueChange={setValue}
            step={1}
            thumbTintColor={primary}
            value={value}
          />
          <Button className="w-full" onPress={handleClose} size="sm">
            <Text>Close</Text>
          </Button>
        </View>
      </BottomSheet>
    );
  }
);

export { HomeBottomSheet };
