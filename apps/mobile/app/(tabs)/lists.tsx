import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, EmptyState, FieldInput, Muted, Screen, Title, colors } from "@/components/ui";
import { generateChecklist } from "@/services/internAI";
import { addList, loadLists, updateList } from "@/storage/listsStorage";
import { loadSettings } from "@/storage/settingsStorage";
import { LifeChecklist } from "@/types/life";

export default function ListsScreen() {
  const [scene, setScene] = useState("周末去露营");
  const [lists, setLists] = useState<LifeChecklist[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => {
    loadLists().then(setLists);
  }, []));

  async function createList() {
    setLoading(true);
    try {
      const settings = await loadSettings();
      const list = await generateChecklist(settings, scene);
      await addList(list);
      setLists([list, ...lists]);
    } catch (error) {
      Alert.alert("生成失败", error instanceof Error ? error.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  async function toggle(list: LifeChecklist, itemId: string) {
    const next = {
      ...list,
      items: list.items.map((item) => item.id === itemId ? { ...item, checked: !item.checked } : item),
      updatedAt: new Date().toISOString()
    };
    await updateList(next);
    setLists((current) => current.map((item) => item.id === next.id ? next : item));
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Title>AI 清单</Title>
          <Muted>输入一个生活场景，生成可勾选的购物、出门或旅行清单。</Muted>
          <FieldInput label="生活场景" value={scene} onChangeText={setScene} placeholder="例如：周末去露营" />
          <View style={styles.examples}>
            {["周末露营", "搬家准备", "短途旅行"].map((example) => (
              <Pressable key={example} style={styles.example} onPress={() => setScene(example)}>
                <Text style={styles.exampleText}>{example}</Text>
              </Pressable>
            ))}
          </View>
          <Button label="生成清单" loading={loading} onPress={createList} />
        </Card>

        {lists.length === 0 ? <EmptyState title="还没有清单" description="可以从周末露营、搬家准备、短途旅行开始生成第一份清单。" /> : lists.map((list) => (
          <Card key={list.id}>
            <Title>{list.title}</Title>
            <Muted>{list.summary}</Muted>
            {list.items.map((item) => (
              <Pressable key={item.id} style={styles.item} onPress={() => toggle(list, item.id)}>
                <View style={[styles.checkbox, item.checked && styles.checked]}><Text style={styles.check}>{item.checked ? "✓" : ""}</Text></View>
                <View style={styles.itemText}>
                  <Text style={[styles.content, item.checked && styles.done]}>{item.content}</Text>
                  <Text style={styles.meta}>{item.quantity || "无需数量"} · {item.category}</Text>
                </View>
              </Pressable>
            ))}
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 12, paddingBottom: 24 },
  examples: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  example: { backgroundColor: colors.soft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: "#b7d9d0" },
  exampleText: { color: colors.primary, fontWeight: "700", fontSize: 12 },
  item: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderTopWidth: 1, borderTopColor: colors.border },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 1, borderColor: "#93c5fd", alignItems: "center", justifyContent: "center" },
  checked: { backgroundColor: colors.primary, borderColor: colors.primary },
  check: { color: "#fff", fontWeight: "800" },
  itemText: { flex: 1 },
  content: { color: colors.text, fontWeight: "700" },
  done: { color: colors.muted, textDecorationLine: "line-through" },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 }
});
