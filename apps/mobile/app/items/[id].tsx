import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LIFE_ITEM_STATUS_META, LIFE_ITEM_TYPE_META, getLifeItemStatusMeta, getLifeItemTypeMeta } from "@/constants/lifeItemMeta";
import { Button, Card, FieldInput, Muted, Screen, Title, colors } from "@/components/ui";
import { scheduleLocalReminder } from "@/services/notifications";
import { deleteLifeItem, getLifeItem, updateLifeItem } from "@/storage/lifeItemsStorage";
import { LifeItem, LifeItemStatus, LifeItemType } from "@/types/life";

const editableFields: Array<{ key: keyof LifeItem; label: string; multiline?: boolean }> = [
  { key: "title", label: "标题" },
  { key: "summary", label: "摘要", multiline: true },
  { key: "amount", label: "金额" },
  { key: "date", label: "日期" },
  { key: "dueDate", label: "到期日" },
  { key: "eventDateTime", label: "日程时间" },
  { key: "location", label: "地点" },
  { key: "merchant", label: "商家" },
  { key: "category", label: "分类" },
  { key: "remindAt", label: "提醒时间" },
  { key: "rawText", label: "原始文本", multiline: true }
];

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<LifeItem | null>(null);

  useEffect(() => {
    if (id) getLifeItem(id).then(setItem).catch(() => setItem(null));
  }, [id]);

  async function patch(patchValue: Partial<LifeItem>) {
    if (!item) return false;
    const next = await updateLifeItem(item.id, patchValue);
    if (!next) {
      Alert.alert("更新失败", "未找到这张生活卡片，请返回列表后重新打开。");
      return false;
    }
    setItem(next);
    return true;
  }

  async function updateStatus(status: LifeItemStatus) {
    const ok = await patch({ status });
    if (ok) Alert.alert("状态已更新", `当前状态：${LIFE_ITEM_STATUS_META[status].label}`);
  }

  async function addReminder() {
    if (!item?.remindAt) {
      Alert.alert("缺少提醒时间", "请先填写提醒时间，例如 2026-05-02 09:00。");
      return;
    }
    try {
      await scheduleLocalReminder(item.title, item.summary, item.remindAt);
      Alert.alert("已创建提醒", "本地通知已加入系统计划。");
    } catch (error) {
      Alert.alert("提醒失败", error instanceof Error ? error.message : "未知错误");
    }
  }

  function confirmDelete() {
    if (!item) return;
    Alert.alert("删除卡片", `确定永久删除“${item.title}”吗？归档不会删除数据，删除后无法恢复。`, [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: async () => {
          await deleteLifeItem(item.id);
          router.back();
        }
      }
    ]);
  }

  if (!item) {
    return <Screen><Card><Muted>未找到这张生活卡片。</Muted></Card></Screen>;
  }

  const typeMeta = getLifeItemTypeMeta(item.type);
  const statusMeta = getLifeItemStatusMeta(item.status);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <View style={styles.head}>
            <Title>{item.title}</Title>
            <Text style={[styles.typeBadge, { color: typeMeta.color, borderColor: typeMeta.color }]}>{typeMeta.label} {item.type}</Text>
          </View>
          <Muted>{item.summary}</Muted>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>类型说明</Text>
            <Text style={styles.infoText}>{typeMeta.description}</Text>
            <Text style={styles.infoHint}>AI 自动分类可能不完全准确，可在下方手动修改类型。</Text>
          </View>
        </Card>

        <Card>
          <Title>修改类型</Title>
          <View style={styles.typeGrid}>
            {(Object.keys(LIFE_ITEM_TYPE_META) as LifeItemType[]).map((type) => {
              const meta = LIFE_ITEM_TYPE_META[type];
              const selected = item.type === type;
              return (
                <Pressable
                  key={type}
                  style={[styles.typeOption, selected && { borderColor: meta.color, backgroundColor: "#f8fafc" }]}
                  onPress={() => patch({ type })}
                >
                  <Text style={[styles.typeOptionLabel, selected && { color: meta.color }]}>{meta.label}</Text>
                  <Text style={styles.typeOptionKey}>{type}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <Title>卡片状态</Title>
          <Text style={styles.currentStatus}>当前状态：{statusMeta.label}</Text>
          <Muted>{statusMeta.description}</Muted>
          <View style={styles.statusDescriptions}>
            {(Object.keys(LIFE_ITEM_STATUS_META) as LifeItemStatus[]).map((status) => (
              <Text key={status} style={styles.statusLine}>
                {LIFE_ITEM_STATUS_META[status].label}：{LIFE_ITEM_STATUS_META[status].description}
              </Text>
            ))}
          </View>
          <View style={styles.actions}>
            <Button label="标记为待处理" variant={item.status === "active" ? "primary" : "secondary"} onPress={() => updateStatus("active")} />
            <Button label="标记为已完成" variant={item.status === "done" ? "primary" : "secondary"} onPress={() => updateStatus("done")} />
            <Button label="归档卡片" variant={item.status === "archived" ? "primary" : "secondary"} onPress={() => updateStatus("archived")} />
          </View>
          <Muted>归档不是删除。已归档卡片不再干扰首页主要列表，但仍保存在本地。</Muted>
        </Card>

        <Card>
          <Title>字段编辑</Title>
          {editableFields.map((field) => (
            <FieldInput
              key={field.key}
              label={field.label}
              multiline={field.multiline}
              keyboardType={field.key === "amount" ? "decimal-pad" : "default"}
              value={String(item[field.key] ?? "")}
              onChangeText={(value) => patch({ [field.key]: field.key === "amount" ? Number(value) || null : value } as Partial<LifeItem>)}
            />
          ))}
        </Card>

        <Card>
          <Title>操作</Title>
          <Button label="添加本地提醒" onPress={addReminder} />
          <Button label="永久删除卡片" variant="danger" onPress={confirmDelete} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 12, paddingBottom: 24 },
  head: { flexDirection: "row", justifyContent: "space-between", gap: 10, alignItems: "center" },
  typeBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontWeight: "800", fontSize: 12 },
  infoBox: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border, gap: 4 },
  infoTitle: { color: colors.text, fontWeight: "800" },
  infoText: { color: colors.text, lineHeight: 20 },
  infoHint: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeOption: { width: "48%", borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 10, gap: 2 },
  typeOptionLabel: { color: colors.text, fontWeight: "800" },
  typeOptionKey: { color: colors.muted, fontSize: 12 },
  currentStatus: { color: colors.text, fontWeight: "800" },
  statusDescriptions: { gap: 6 },
  statusLine: { color: colors.muted, lineHeight: 19 },
  actions: { gap: 8 }
});
