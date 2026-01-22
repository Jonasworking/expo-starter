import { View } from "react-native";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function Home() {
  return (
    <Container className="p-4">
      <View className="mb-4 py-6">
        <Text className="font-semibold text-3xl text-foreground tracking-tight">
          Better T Stack
        </Text>
        <Text className="mt-1 text-muted-foreground text-sm">
          Full-stack TypeScript starter
        </Text>
        <Button>
          <Text> lol</Text>
        </Button>
      </View>
    </Container>
  );
}
