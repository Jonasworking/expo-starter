import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback } from "react";
import { View } from "react-native";
import { useThemeColor } from "@/lib/theme/use-theme-color";

interface BottomSheetProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  enableDynamicSizing?: boolean;
}

const BottomSheet = forwardRef<BottomSheetModal, BottomSheetProps>(
  function BottomSheet(
    { children, snapPoints, enableDynamicSizing = true },
    ref
  ) {
    const [background, foreground, border] = useThemeColor([
      "card",
      "foreground",
      "border",
    ]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: background }}
        enableDynamicSizing={enableDynamicSizing}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: foreground, opacity: 0.4 }}
        ref={ref}
        snapPoints={snapPoints}
      >
        <BottomSheetView>
          <View
            className="pb-8"
            style={{ borderTopColor: border, borderTopWidth: 0 }}
          >
            {children}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export { BottomSheet };
export type { BottomSheetProps };
