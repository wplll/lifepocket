import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, EmptyState, Muted, Screen, Title, colors } from "@/components/ui";
import { loadLifeItems } from "@/storage/lifeItemsStorage";
import { LifeItem } from "@/types/life";
import { formatDate } from "@/utils/dates";
import {
  ExpenseRange,
  getExpensesByCategory,
  getExpensesByRange,
  normalizeCategory,
  rangeLabel,
  sumExpenseAmount
} from "@/utils/expenseStats";

const ranges: ExpenseRange[] = ["day", "week", "month"];

export default function ExpenseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ range?: string; category?: string }>();
  const [items, setItems] = useState<LifeItem[]>([]);

  useEffect(() => {
    loadLifeItems().then(setItems).catch(() => setItems([]));
  }, []);

  const title = useMemo(() => {
    if (isRange(params.range)) return `${rangeLabel(params.range)}明细`;
    if (params.category) return `${normalizeCategory(decodeURIComponent(params.category))}消费明细`;
    return "消费明细";
  }, [params.range, params.category]);

  const filtered = useMemo(() => {
    if (isRange(params.range)) return getExpensesByRange(items, params.range);
    if (params.category) return getExpensesByCategory(items, decodeURIComponent(params.category));
    return [];
  }, [items, params.range, params.category]);

  const total = sumExpenseAmount(filtered);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>返回</Text>
          </Pressable>
          <Title>{title}</Title>
          <Muted>共 {filtered.length} 笔，合计 ¥{total.toFixed(2)}</Muted>
        </Card>

        <Card>
          {filtered.length === 0 ? (
            <EmptyState title="没有匹配的消费" description="当前筛选范围内没有保存的消费记录，或消费金额为空。" />
          ) : filtered.map((item) => (
            <Link key={item.id} href={`/items/${item.id}`} asChild>
              <Pressable style={styles.itemRow}>
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.itemMeta} numberOfLines={1}>
                    {formatDate(item.date || item.createdAt)} · {item.merchant || "未记录商家"} · {normalizeCategory(item.category)}
                  </Text>
                  <Text style={styles.source}>来源卡片：{item.title}</Text>
                </View>
                <Text style={styles.amount}>¥{(typeof item.amount === "number" ? item.amount : 0).toFixed(2)}</Text>
              </Pressable>
            </Link>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function isRange(value: unknown): value is ExpenseRange {
  return typeof value === "string" && ranges.includes(value as ExpenseRange);
}

const styles = StyleSheet.create({
  scroll: { gap: 12, paddingBottom: 24 },
  back: { color: colors.primary, fontWeight: "800" },
  itemRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  itemText: { flex: 1, gap: 3 },
  itemTitle: { color: colors.text, fontWeight: "800", fontSize: 16 },
  itemMeta: { color: colors.muted, fontSize: 12 },
  source: { color: colors.muted, fontSize: 12 },
  amount: { color: colors.text, fontWeight: "900" }
});
