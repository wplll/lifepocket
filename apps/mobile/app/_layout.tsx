import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack, type ErrorBoundaryProps } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function RootLayout() {
  const [fontsLoaded] = useFonts(Ionicons.font);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="items/[id]"
          options={{ title: "生活卡片详情", headerBackTitle: "返回", headerTintColor: "#2563eb" }}
        />
        <Stack.Screen
          name="lists/[id]"
          options={{ title: "清单详情", headerBackTitle: "返回", headerTintColor: "#2563eb" }}
        />
        <Stack.Screen
          name="expenses/detail"
          options={{ title: "消费明细", headerBackTitle: "返回", headerTintColor: "#2563eb" }}
        />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.errorScreen}>
      <Text style={styles.errorTitle}>应用启动失败</Text>
      <Text style={styles.errorText}>{error.message}</Text>
      <Pressable style={styles.errorButton} onPress={retry}>
        <Text style={styles.errorButtonText}>重试</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  errorScreen: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8f3ea",
    gap: 12
  },
  errorTitle: {
    color: "#16212a",
    fontSize: 22,
    fontWeight: "800"
  },
  errorText: {
    color: "#66747f",
    lineHeight: 20
  },
  errorButton: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: "#237e6f",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8
  },
  errorButtonText: {
    color: "#fff",
    fontWeight: "700"
  }
});
