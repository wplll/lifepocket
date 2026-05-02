import { LifeItem } from "@/types/life";

export type ExpenseRange = "day" | "week" | "month";

export function getExpensesByRange(items: LifeItem[], range: ExpenseRange) {
  const now = new Date();
  const { start, end } = rangeBounds(now, range);
  return getExpenseItems(items).filter((item) => {
    const date = getExpenseDate(item);
    return date ? date >= start && date < end : false;
  });
}

export function getExpensesByCategory(items: LifeItem[], category: string) {
  const normalized = normalizeCategory(category);
  return getExpenseItems(items).filter((item) => normalizeCategory(item.category) === normalized);
}

export function getExpenseItems(items: LifeItem[]) {
  return items.filter((item) => item.type === "expense");
}

export function sumExpenseAmount(items: LifeItem[]) {
  return items.reduce((total, item) => total + (typeof item.amount === "number" && Number.isFinite(item.amount) ? item.amount : 0), 0);
}

export function groupExpensesByCategory(items: LifeItem[]) {
  const map = new Map<string, { category: string; total: number; count: number; items: LifeItem[] }>();
  getExpenseItems(items).forEach((item) => {
    const category = normalizeCategory(item.category);
    const current = map.get(category) || { category, total: 0, count: 0, items: [] };
    current.count += 1;
    current.total += typeof item.amount === "number" && Number.isFinite(item.amount) ? item.amount : 0;
    current.items.push(item);
    map.set(category, current);
  });
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function getExpenseDate(item: LifeItem) {
  const value = item.date || item.createdAt;
  if (!value) return null;
  const date = new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function normalizeCategory(category?: string | null) {
  const value = category?.trim();
  return value || "其他";
}

export function rangeLabel(range: ExpenseRange) {
  if (range === "day") return "今日消费";
  if (range === "week") return "本周消费";
  return "本月消费";
}

function rangeBounds(now: Date, range: ExpenseRange) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (range === "week") {
    const day = start.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + mondayOffset);
  }

  if (range === "month") {
    start.setDate(1);
  }

  const end = new Date(start);
  if (range === "day") end.setDate(start.getDate() + 1);
  if (range === "week") end.setDate(start.getDate() + 7);
  if (range === "month") end.setMonth(start.getMonth() + 1);

  return { start, end };
}
