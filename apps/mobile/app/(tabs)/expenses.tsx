import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, EmptyState, Muted, Screen, Title, colors } from "@/components/ui";
import { loadLifeItems } from "@/storage/lifeItemsStorage";
import { LifeItem } from "@/types/life";
import { isThisMonth, isThisWeek } from "@/utils/dates";

export default function ExpensesScreen() {
  const [items, setItems] = useState<LifeItem[]>([]);
  useFocusEffect(useCallback(() => {
    loadLifeItems().then(setItems);
  }, []));

  const expenses = items.filter((item) => item.type === "expense");
  const weekTotal = sum(expenses.filter((item) => isThisWeek(item.date || item.createdAt)));
  const monthTotal = sum(expenses.filter((item) => isThisMonth(item.date || item.createdAt)));
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((item) => map.set(item.category || "其他", (map.get(item.category || "其他") || 0) + (item.amount || 0)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.cards}>
          <Card><Muted>本周消费</Muted><Text style={styles.money}>¥{weekTotal.toFixed(2)}</Text></Card>
          <Card><Muted>本月消费</Muted><Text style={styles.money}>¥{monthTotal.toFixed(2)}</Text></Card>
        </View>
        <Card>
          <Title>分类统计</Title>
          {categories.length === 0 ? <EmptyState title="暂无消费记录" description="保存小票、订单或账单后，会自动生成分类统计。" /> : categories.map(([category, total]) => (
            <View key={category} style={styles.categoryBlock}>
              <View style={styles.row}>
                <Text style={styles.category}>{category}</Text>
                <Text style={styles.total}>¥{total.toFixed(2)}</Text>
              </View>
              <View style={styles.bar}><View style={[styles.barFill, { width: `${Math.max(monthTotal ? total / monthTotal * 100 : 0, 8)}%` }]} /></View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function sum(items: LifeItem[]) {
  return items.reduce((total, item) => total + (item.amount || 0), 0);
}

const styles = StyleSheet.create({
  scroll: { gap: 12, paddingBottom: 24 },
  cards: { gap: 12 },
  money: { color: colors.text, fontSize: 28, fontWeight: "800" },
  categoryBlock: { gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  row: { flexDirection: "row", justifyContent: "space-between" },
  category: { color: colors.text, fontWeight: "700" },
  total: { color: colors.primary, fontWeight: "800" },
  bar: { height: 8, borderRadius: 999, backgroundColor: colors.soft, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 999, backgroundColor: colors.primary }
});
