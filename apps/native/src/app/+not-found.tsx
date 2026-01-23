import { Link, Stack } from "expo-router";

import { View } from "react-native";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <Container>
        <View className="flex-1 items-center justify-center p-4">
          <Card className="max-w-sm items-center rounded-lg p-6">
            <Text className="mb-3 text-4xl">🤔</Text>
            <Text className="mb-1 font-medium text-foreground text-lg">
              Page Not Found
            </Text>
            <Text className="mb-4 text-center text-muted text-sm">
              The page you're looking for doesn't exist.
            </Text>
            <Link asChild href="/">
              <Button size="sm">Go Home</Button>
            </Link>
          </Card>
        </View>
      </Container>
    </>
  );
}
