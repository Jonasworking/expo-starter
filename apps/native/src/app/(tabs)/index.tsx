import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useCallback, useRef } from "react";
import { View } from "react-native";
import { Container } from "@/components/container";
import { BoltBoldIcon } from "@/components/icons/solar/bolt-bold";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { HomeBottomSheet } from "./home-bottom-sheet";

export default function Home() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const handleOpenSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <Container className="p-6">
      <View className="flex-1 items-center justify-center">
        <Card className="items-center p-8">
          <CardTitle className="mb-2 text-3xl">Tab One</CardTitle>
          <BoltBoldIcon className="mb-4 size-10 text-primary" />
          <Button onPress={handleOpenSheet}>
            <Text>Open Bottom Sheet</Text>
          </Button>
        </Card>
      </View>

      <HomeBottomSheet ref={bottomSheetRef} />
    </Container>
  );
}
