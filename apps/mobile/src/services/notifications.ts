import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export async function scheduleLocalReminder(title: string, body: string, remindAt: string) {
  const date = new Date(remindAt.replace(" ", "T"));
  if (Number.isNaN(date.getTime()) || date <= new Date()) {
    throw new Error("提醒时间无效或已经过去。");
  }

  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    throw new Error("没有通知权限，无法创建本地提醒。");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("lifepocket-reminders", {
      name: "LifePocket 提醒",
      importance: Notifications.AndroidImportance.DEFAULT
    });
  }

  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: "lifepocket-reminders"
    }
  });
}
