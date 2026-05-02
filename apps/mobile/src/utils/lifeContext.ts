import { getLifeItemStatusMeta, getLifeItemTypeMeta } from "@/constants/lifeItemMeta";
import { LifeItem, LifeList } from "@/types/life";
import { getExpensesByRange, groupExpensesByCategory, sumExpenseAmount } from "@/utils/expenseStats";

export function buildLifeContextForChat(items: LifeItem[], lists: LifeList[] = []) {
  const recentItems = [...items]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 30);
  const activeItems = items
    .filter((item) => item.status === "active")
    .sort((a, b) => (a.dueDate || a.eventDateTime || a.date || a.createdAt).localeCompare(b.dueDate || b.eventDateTime || b.date || b.createdAt))
    .slice(0, 12);
  const monthExpenses = getExpensesByRange(items, "month");
  const categoryLines = groupExpensesByCategory(monthExpenses)
    .slice(0, 8)
    .map((group) => `- ${group.category}：¥${group.total.toFixed(2)}，${group.count} 笔`);

  const lines = [
    "以下是用户在 LifePocket 中保存的部分生活记录摘要，已经压缩和脱敏：",
    "",
    "消费统计：",
    `- 本月总消费：¥${sumExpenseAmount(monthExpenses).toFixed(2)}，${monthExpenses.length} 笔`,
    ...categoryLines,
    "",
    "待处理事项：",
    ...(activeItems.length ? activeItems.map(formatActiveItem) : ["- 当前没有保存的待处理事项摘要。"]),
    "",
    "最近生活卡片：",
    ...(recentItems.length ? recentItems.map((item, index) => `${index + 1}. ${formatRecentItem(item)}`) : ["1. 当前没有保存的生活卡片。"]),
    "",
    "清单摘要：",
    ...(lists.length ? lists.slice(0, 8).map(formatList) : ["- 当前没有保存的历史清单。"])
  ];

  return lines.join("\n");
}

function formatActiveItem(item: LifeItem) {
  const date = item.dueDate || item.eventDateTime || item.date || "";
  const amount = typeof item.amount === "number" ? `，金额 ¥${item.amount.toFixed(2)}` : "";
  return `- ${item.title}${amount}${date ? `，时间 ${date}` : ""}`;
}

function formatRecentItem(item: LifeItem) {
  const type = getLifeItemTypeMeta(item.type).label;
  const status = getLifeItemStatusMeta(item.status).label;
  const amount = typeof item.amount === "number" ? `，金额：¥${item.amount.toFixed(2)}` : "";
  const date = item.date || item.dueDate || item.eventDateTime || item.createdAt;
  const category = item.category ? `，分类：${item.category}` : "";
  return `类型：${type}，状态：${status}，标题：${item.title}${amount}，日期：${date}${category}`;
}

function formatList(list: LifeList) {
  const done = list.items.filter((item) => item.checked).length;
  return `- ${list.title}：${list.summary || "无说明"}，进度 ${done}/${list.items.length}`;
}
