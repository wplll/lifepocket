import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, FieldInput, Muted, Screen, Title, colors } from "@/components/ui";
import { scheduleLocalReminder } from "@/services/notifications";
import { getLifeItem, updateLifeItem } from "@/storage/lifeItemsStorage";
import { LifeItem, LifeItemStatus, typeLabels } from "@/types/life";

const fields: Array<keyof LifeItem> = ["type", "title", "summary", "amount", "date", "dueDate", "location", "merchant", "category", "remindAt", "rawText"];

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<LifeItem | null>(null);

  useEffect(() => {
    if (id) getLifeItem(id).then(setItem);
  }, [id]);

  async function patch(patchValue: Partial<LifeItem>) {
    if (!item) return;
    const next = await updateLifeItem(item.id, patchValue);
    setItem(next);
  }

  async function addReminder() {
    if (!item?.remindAt) {
      Alert.alert("缺少提醒时间", "请先填写 remindAt，例如 2026-05-02 09:00。");
      return;
    }
    try {
      await scheduleLocalReminder(item.title, item.summary, item.remindAt);
      Alert.alert("已创建提醒", "本地通知已加入系统计划。");
    } catch (error) {
      Alert.alert("提醒失败", error instanceof Error ? error.message : "未知错误");
    }
  }

  if (!item) {
    return <Screen><Card><Muted>未找到这张生活卡片。</Muted></Card></Screen>;
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <View style={styles.head}>
            <Title>{item.title}</Title>
            <Text style={styles.type}>{typeLabels[item.type]}</Text>
          </View>
          <Muted>{item.summary}</Muted>
          <Text style={styles.status}>状态：{item.status}</Text>
        </Card>

        <Card>
          <Title>字段编辑</Title>
          {fields.map((field) => (
            <FieldInput
              key={field}
              label={field}
              multiline={field === "rawText" || field === "summary"}
              keyboardType={field === "amount" ? "decimal-pad" : "default"}
              value={String(item[field] ?? "")}
              onChangeText={(value) => patch({ [field]: field === "amount" ? Number(value) || null : value } as Partial<LifeItem>)}
            />
          ))}
        </Card>

        <Card>
          <Title>操作</Title>
          <Button label="添加本地提醒" onPress={addReminder} />
          <View style={styles.actions}>
            <Button label="已完成 / 已支付" variant="secondary" onPress={() => patch({ status: "done" as LifeItemStatus })} />
            <Button label="归档" variant="secondary" onPress={() => patch({ status: "archived" as LifeItemStatus })} />
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 12, paddingBottom: 24 },
  head: { flexDirection: "row", justifyContent: "space-between", gap: 10, alignItems: "center" },
  type: { color: colors.primary, fontWeight: "800" },
  status: { color: colors.muted, marginTop: 4 },
  actions: { gap: 8 }
});
