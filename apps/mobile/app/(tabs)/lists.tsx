import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LIFE_LIST_TYPE_LABELS } from "@/constants/lifeItemMeta";
import { Button, Card, EmptyState, FieldInput, Muted, Screen, Title, colors } from "@/components/ui";
import { generateChecklist } from "@/services/internAI";
import { deleteList, getLists, saveList } from "@/storage/listsStorage";
import { LifeList } from "@/types/life";

const examples = ["周末露营", "搬家准备", "短途旅行", "去医院看牙", "准备考试"];

export default function ListsScreen() {
  const router = useRouter();
  const [scene, setScene] = useState("周末露营");
  const [lists, setLists] = useState<LifeList[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => {
    refresh();
  }, []));

  function refresh() {
    getLists().then(setLists).catch(() => setLists([]));
  }

  async function createList() {
    setLoading(true);
    try {
      const list = await generateChecklist(null, scene);
      await saveList(list);
      setLists((current) => [list, ...current.filter((item) => item.id !== list.id)]);
      Alert.alert("清单已生成", "已保存到历史清单。", [
        { text: "继续生成" },
        { text: "查看", onPress: () => router.push(`/lists/${list.id}`) }
      ]);
    } catch (error) {
      Alert.alert("生成失败", error instanceof Error ? error.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete(list: LifeList) {
    Alert.alert("删除清单", `确定删除“${list.title}”吗？此操作只删除本地这份清单。`, [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: async () => {
          await deleteList(list.id);
          setLists((current) => current.filter((item) => item.id !== list.id));
        }
      }
    ]);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Title>AI 清单</Title>
          <Muted>输入一个生活场景，AI 会生成清单并保存到历史记录。你可以进入详情页继续编辑、勾选和删除项目。</Muted>
          <FieldInput label="生活场景" value={scene} onChangeText={setScene} placeholder="例如：周末去露营" />
          <View style={styles.examples}>
            {examples.map((example) => (
              <Pressable key={example} style={styles.example} onPress={() => setScene(example)}>
                <Text style={styles.exampleText}>{example}</Text>
              </Pressable>
            ))}
          </View>
          <Button label="生成并保存清单" loading={loading} onPress={createList} />
        </Card>

        <Card>
          <Title>历史清单</Title>
          {lists.length === 0 ? (
            <EmptyState title="还没有清单" description="输入一个生活场景，让 AI 帮你生成第一份清单。" />
          ) : lists.map((list) => (
            <ListCard key={list.id} list={list} onDelete={() => confirmDelete(list)} />
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function ListCard({ list, onDelete }: { list: LifeList; onDelete: () => void }) {
  const done = list.items.filter((item) => item.checked).length;
  return (
    <View style={styles.listCard}>
      <Link href={`/lists/${list.id}`} asChild>
        <Pressable style={styles.listPress}>
          <View style={styles.listHead}>
            <Text style={styles.listTitle} numberOfLines={1}>{list.title}</Text>
            <Text style={styles.progress}>{done}/{list.items.length}</Text>
          </View>
          <Text style={styles.listType}>{LIFE_LIST_TYPE_LABELS[list.type]}</Text>
          <Text style={styles.summary} numberOfLines={2}>{list.summary || "没有说明"}</Text>
          <Text style={styles.time}>创建：{formatDate(list.createdAt)}  更新：{formatDate(list.updatedAt)}</Text>
        </Pressable>
      </Link>
      <Button label="删除" variant="secondary" onPress={onDelete} />
    </View>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  scroll: { gap: 12, paddingBottom: 24 },
  examples: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  example: { backgroundColor: colors.soft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: "#b7d9d0" },
  exampleText: { color: colors.primary, fontWeight: "700", fontSize: 12 },
  listCard: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 10 },
  listPress: { gap: 5 },
  listHead: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  listTitle: { flex: 1, color: colors.text, fontSize: 17, fontWeight: "800" },
  progress: { color: colors.primary, fontWeight: "800" },
  listType: { color: colors.primary, fontWeight: "700", fontSize: 12 },
  summary: { color: colors.muted, lineHeight: 19 },
  time: { color: colors.muted, fontSize: 12 }
});
