import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="items/[id]"
          options={{
            title: "生活卡片详情",
            headerBackTitle: "返回",
            headerTintColor: "#2563eb"
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
