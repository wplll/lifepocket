import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const tabs = {
  index: ["首页", "home-outline"],
  upload: ["上传", "cloud-upload-outline"],
  expenses: ["消费", "card-outline"],
  lists: ["清单", "checkbox-outline"],
  chat: ["对话", "chatbubble-ellipses-outline"],
  settings: ["设置", "settings-outline"]
} as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerTitleAlign: "center",
        headerTintColor: "#16212a",
        headerStyle: { backgroundColor: "#f8f3ea" },
        tabBarActiveTintColor: "#237e6f",
        tabBarInactiveTintColor: "#66747f",
        tabBarLabelStyle: { fontSize: 11 },
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 6, backgroundColor: "#fffdf9", borderTopColor: "#e7dcca" },
        tabBarIcon: ({ color, size }) => {
          const icon = tabs[route.name as keyof typeof tabs]?.[1] ?? "ellipse-outline";
          return <Ionicons name={icon} size={size} color={color} />;
        }
      })}
    >
      <Tabs.Screen name="index" options={{ title: tabs.index[0] }} />
      <Tabs.Screen name="upload" options={{ title: tabs.upload[0] }} />
      <Tabs.Screen name="expenses" options={{ title: tabs.expenses[0] }} />
      <Tabs.Screen name="lists" options={{ title: tabs.lists[0] }} />
      <Tabs.Screen name="chat" options={{ title: tabs.chat[0] }} />
      <Tabs.Screen name="settings" options={{ title: tabs.settings[0] }} />
    </Tabs>
  );
}
