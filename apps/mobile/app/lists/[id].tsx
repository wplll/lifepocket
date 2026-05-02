import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LIFE_LIST_TYPE_LABELS } from "@/constants/lifeItemMeta";
import { Button, Card, FieldInput, Muted, Screen, Title, colors } from "@/components/ui";
import { createId } from "@/utils/json";
import { deleteList, getListById, updateList } from "@/storage/listsStorage";
import { LifeList, LifeListItem } from "@/types/life";

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [list, setList] = useState<LifeList | null>(null);
  const [newContent, setNewContent] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    if (id) getListById(id).then(setList).catch(() => setList(null));
  }, [id]);

  async function persist(next: LifeList) {
    const updated = { ...next, updatedAt: new Date().toISOString() };
    setList(updated);
    await updateList(updated);
  }

  async function patch(patchValue: Partial<LifeList>) {
    if (!list) return;
    await persist({ ...list, ...patchValue });
  }

  async function patchItem(itemId: string, patchValue: Partial<LifeListItem>) {
    if (!list) return;
    const now = new Date().toISOString();
    await persist({
      ...list,
      items: list.items.map((item) => item.id === itemId ? { ...item, ...patchValue, updatedAt: now } : item)
    });
  }

  async function addItem() {
    if (!list || !newContent.trim()) {
      Alert.alert("缺少内容", "请先输入清单事项。");
      return;
    }
    const now = new Date().toISOString();
    const item: LifeListItem = {
      id: createId("list-item"),
      content: newContent.trim(),
      quantity: newQuantity.trim() || null,
      category: newCategory.trim() || "其他",
      checked: false,
      createdAt: now,
      updatedAt: now
    };
    await persist({ ...list, items: [...list.items, item] });
    setNewContent("");
    setNewQuantity("");
    setNewCategory("");
  }

  async function removeItem(itemId: string) {
    if (!list) return;
    await persist({ ...list, items: list.items.filter((item) => item.id !== itemId) });
  }

  function confirmDeleteList() {
    if (!list) return;
    Alert.alert("删除整个清单", `确定删除“${list.title}”吗？`, [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: async () => {
          await deleteList(list.id);
          router.back();
        }
      }
    ]);
  }

  if (!list) {
    return <Screen><Card><Muted>未找到这份清单。</Muted></Card></Screen>;
  }

  const done = list.items.filter((item) => item.checked).length;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Title>清单详情</Title>
          <FieldInput label="标题" value={list.title} onChangeText={(title) => patch({ title })} />
          <FieldInput label="说明" multiline value={list.summary || ""} onChangeText={(summary) => patch({ summary })} />
          <Text style={styles.meta}>{LIFE_LIST_TYPE_LABELS[list.type]} · 已完成 {done}/{list.items.length}</Text>
          <Muted>修改会立即保存到本地历史清单。</Muted>
        </Card>

        <Card>
          <Title>清单项</Title>
          {list.items.length === 0 ? <Muted>还没有清单项，可以在下方添加。</Muted> : list.items.map((item) => (
            <View key={item.id} style={styles.item}>
              <Pressable style={[styles.checkbox, item.checked && styles.checked]} onPress={() => patchItem(item.id, { checked: !item.checked })}>
                <Text style={styles.check}>{item.checked ? "✓" : ""}</Text>
              </Pressable>
              <View style={styles.itemFields}>
                <FieldInput label="事项" value={item.content} onChangeText={(content) => patchItem(item.id, { content })} />
                <View style={styles.inlineFields}>
                  <FieldInput label="数量" value={item.quantity || ""} onChangeText={(quantity) => patchItem(item.id, { quantity: quantity || null })} style={styles.inlineInput} />
                  <FieldInput label="分类" value={item.category || ""} onChangeText={(category) => patchItem(item.id, { category: category || null })} style={styles.inlineInput} />
                </View>
                <Button label="删除此项" variant="secondary" onPress={() => removeItem(item.id)} />
              </View>
            </View>
          ))}
        </Card>

        <Card>
          <Title>添加清单项</Title>
          <FieldInput label="事项" value={newContent} onChangeText={setNewContent} placeholder="例如：牙刷" />
          <View style={styles.inlineFields}>
            <FieldInput label="数量" value={newQuantity} onChangeText={setNewQuantity} placeholder="例如：1 个" style={styles.inlineInput} />
            <FieldInput label="分类" value={newCategory} onChangeText={setNewCategory} placeholder="例如：洗漱" style={styles.inlineInput} />
          </View>
          <Button label="添加" onPress={addItem} />
        </Card>

        <Card>
          <Title>危险操作</Title>
          <Button label="删除整个清单" variant="danger" onPress={confirmDeleteList} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 12, paddingBottom: 24 },
  meta: { color: colors.primary, fontWeight: "800" },
  item: { flexDirection: "row", gap: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  checkbox: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: "#93c5fd", alignItems: "center", justifyContent: "center", marginTop: 26 },
  checked: { backgroundColor: colors.primary, borderColor: colors.primary },
  check: { color: "#fff", fontWeight: "800" },
  itemFields: { flex: 1, gap: 8 },
  inlineFields: { flexDirection: "row", gap: 8 },
  inlineInput: { minWidth: 0 }
});
