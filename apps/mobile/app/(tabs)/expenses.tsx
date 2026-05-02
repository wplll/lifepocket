import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, EmptyState, Muted, Screen, Title, colors } from "@/components/ui";
import { loadLifeItems } from "@/storage/lifeItemsStorage";
import { LifeItem } from "@/types/life";
import {
  getExpensesByRange,
  groupExpensesByCategory,
  rangeLabel,
  sumExpenseAmount,
  ExpenseRange
} from "@/utils/expenseStats";

export default function ExpensesScreen() {
  const router = useRouter();
  const [items, setItems] = useState<LifeItem[]>([]);

  useFocusEffect(useCallback(() => {
    loadLifeItems().then(setItems).catch(() => setItems([]));
  }, []));

  const totals = useMemo(() => ({
    day: getExpensesByRange(items, "day"),
    week: getExpensesByRange(items, "week"),
    month: getExpensesByRange(items, "month")
  }), [items]);
  const categories = useMemo(() => groupExpensesByCategory(items), [items]);
  const monthTotal = sumExpenseAmount(totals.month);

  function openRange(range: ExpenseRange) {
    router.push(`/expenses/detail?range=${range}`);
  }

  function openCategory(category: string) {
    router.push(`/expenses/detail?category=${encodeURIComponent(category)}`);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.statGrid}>
          <StatCard range="day" items={totals.day} onPress={() => openRange("day")} />
          <StatCard range="week" items={totals.week} onPress={() => openRange("week")} />
          <StatCard range="month" items={totals.month} onPress={() => openRange("month")} />
        </View>

        <Card>
          <Title>分类消费</Title>
          {categories.length === 0 ? (
            <EmptyState title="暂无消费记录" description="保存小票、订单或账单后，消费记录会自动进入这里。金额为空的记录会保留，但不计入总额。" />
          ) : categories.map((group) => (
            <Pressable key={group.category} style={styles.categoryBlock} onPress={() => openCategory(group.category)}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.category}>{group.category}</Text>
                  <Text style={styles.count}>{group.count} 笔消费，点击查看明细</Text>
                </View>
                <Text style={styles.total}>¥{group.total.toFixed(2)}</Text>
              </View>
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${Math.max(monthTotal ? group.total / monthTotal * 100 : 0, 6)}%` }]} />
              </View>
            </Pressable>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function StatCard({ range, items, onPress }: { range: ExpenseRange; items: LifeItem[]; onPress: () => void }) {
  return (
    <Pressable style={styles.statCard} onPress={onPress}>
      <Muted>{rangeLabel(range)}</Muted>
      <Text style={styles.money}>¥{sumExpenseAmount(items).toFixed(2)}</Text>
      <Text style={styles.statHint}>点击查看{rangeLabel(range).replace("消费", "")}明细</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 12, paddingBottom: 24 },
  statGrid: { gap: 10 },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 4
  },
  money: { color: colors.text, fontSize: 28, fontWeight: "800" },
  statHint: { color: colors.primary, fontSize: 12, fontWeight: "700" },
  categoryBlock: { gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  category: { color: colors.text, fontWeight: "700" },
  count: { color: colors.muted, fontSize: 12, marginTop: 2 },
  total: { color: colors.primary, fontWeight: "800" },
  bar: { height: 8, borderRadius: 999, backgroundColor: colors.soft, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 999, backgroundColor: colors.primary }
});
