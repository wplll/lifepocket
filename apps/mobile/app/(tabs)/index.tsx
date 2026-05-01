import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, Muted, Screen, Title, colors } from "@/components/ui";
import { loadLifeItems } from "@/storage/lifeItemsStorage";
import { LifeItem, typeLabels } from "@/types/life";
import { formatDate, formatDateTime, isThisWeek } from "@/utils/dates";

export default function HomeScreen() {
  const router = useRouter();
  const [items, setItems] = useState<LifeItem[]>([]);

  useFocusEffect(useCallback(() => {
    loadLifeItems().then(setItems);
  }, []));

  const today = new Date().toISOString().slice(0, 10);
  const todaysItems = items.filter((item) => [item.date, item.dueDate, item.eventDateTime?.slice(0, 10)].includes(today));
  const weekTotal = items
    .filter((item) => item.type === "expense" && isThisWeek(item.date || item.createdAt))
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Title>今日生活口袋</Title>
            <Muted>整理截图、账单、预约和待办。</Muted>
          </View>
          <Button label="上传" onPress={() => router.push("/upload")} />
        </View>

        <View style={styles.quickGrid}>
          <Link href="/upload" asChild><Pressable style={styles.quick}><Text style={styles.quickText}>上传截图</Text></Pressable></Link>
          <Link href="/upload" asChild><Pressable style={styles.quick}><Text style={styles.quickText}>拍照</Text></Pressable></Link>
          <Link href="/upload" asChild><Pressable style={styles.quick}><Text style={styles.quickText}>粘贴文本</Text></Pressable></Link>
        </View>

        <Card>
          <Muted>本周消费</Muted>
          <Text style={styles.money}>¥{weekTotal.toFixed(2)}</Text>
        </Card>

        <Card>
          <Title>今天要处理</Title>
          {todaysItems.length === 0 ? <Muted>今天还没有到期事项。</Muted> : todaysItems.map((item) => <ItemRow key={item.id} item={item} />)}
        </Card>

        <Card>
          <Title>最近识别</Title>
          {items.length === 0 ? <Muted>保存第一张生活卡片后，会显示在这里。</Muted> : items.slice(0, 5).map((item) => <ItemRow key={item.id} item={item} />)}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function ItemRow({ item }: { item: LifeItem }) {
  return (
    <Link href={`/items/${item.id}`} asChild>
      <Pressable style={styles.row}>
        <View style={styles.badge}><Text style={styles.badgeText}>{typeLabels[item.type]}</Text></View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.rowMeta} numberOfLines={1}>{formatDateTime(item.remindAt) !== "-" ? `提醒 ${formatDateTime(item.remindAt)}` : formatDate(item.date || item.createdAt)}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 12, paddingBottom: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", gap: 12, alignItems: "center" },
  quickGrid: { flexDirection: "row", gap: 8 },
  quick: { flex: 1, backgroundColor: colors.soft, borderRadius: 12, minHeight: 58, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#bfdbfe" },
  quickText: { color: colors.primary, fontWeight: "700" },
  money: { fontSize: 30, fontWeight: "800", color: colors.text },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
  badge: { backgroundColor: colors.soft, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  badgeText: { color: colors.primary, fontSize: 12, fontWeight: "700" },
  rowText: { flex: 1 },
  rowTitle: { color: colors.text, fontWeight: "700" },
  rowMeta: { color: colors.muted, fontSize: 12, marginTop: 2 }
});
