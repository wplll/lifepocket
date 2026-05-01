import type { Checklist, LifeCard, LifeCardType } from "@/lib/demo-data";

const keywordTypeMap: Array<[LifeCardType, string[]]> = [
  ["bill", ["账单", "房租", "水电", "燃气", "缴费", "还款"]],
  ["appointment", ["预约", "复诊", "会议", "面试", "挂号", "到店"]],
  ["travel", ["机票", "酒店", "高铁", "航班", "行程", "旅行"]],
  ["warranty", ["保修", "质保", "维修", "序列号"]],
  ["shopping", ["购物车", "下单", "收货", "快递", "配送"]],
  ["todo", ["待办", "记得", "完成", "提交"]],
  ["expense", ["支付", "付款", "消费", "合计", "订单", "¥", "元"]]
];

export function classifyLifeInput(text: string): LifeCardType {
  const normalized = text.toLowerCase();
  const match = keywordTypeMap.find(([, keywords]) =>
    keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))
  );

  return match?.[0] ?? "other";
}

export function extractLifeCard(text: string): LifeCard {
  const type = classifyLifeInput(text);
  const amountMatch = text.match(/(?:¥|￥)?\s*(\d+(?:\.\d{1,2})?)\s*(?:元)?/);
  const dateMatch = text.match(/(\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{1,2}月\d{1,2}日)/);
  const merchantMatch = text.match(/(?:商家|店铺|收款方|酒店|诊所)[:：]\s*([^\n，,]+)/);
  const title = buildTitle(type, text);

  return {
    id: `generated-${Date.now()}`,
    type,
    title,
    summary: text.length > 52 ? `${text.slice(0, 52)}...` : text,
    amount: amountMatch ? Number(amountMatch[1]) : undefined,
    currency: "CNY",
    occurredAt: dateMatch ? normalizeDate(dateMatch[1]) : undefined,
    reminderAt:
      type === "bill" || type === "appointment" || type === "todo"
        ? "2026-05-03T20:00:00+08:00"
        : undefined,
    merchant: merchantMatch?.[1]?.trim(),
    category: inferCategory(type),
    sourceKind: "text",
    sourceText: text
  };
}

export function generateChecklist(kind: Checklist["kind"], context: string): Checklist {
  const baseItems: Record<Checklist["kind"], string[]> = {
    shopping: ["确认预算", "检查库存", "比价", "优惠券", "配送时间"],
    travel: ["证件", "交通票据", "住宿信息", "充电器", "天气用品"],
    outing: ["钥匙", "手机", "钱包", "耳机", "关闭门窗"]
  };

  const titleMap = {
    shopping: "AI 购物清单",
    travel: "AI 旅行清单",
    outing: "AI 出门清单"
  };

  const contextItems = context
    .split(/[，,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  return {
    id: `checklist-${Date.now()}`,
    kind,
    title: titleMap[kind],
    items: [...new Set([...contextItems, ...baseItems[kind]])].slice(0, 8)
  };
}

function buildTitle(type: LifeCardType, text: string) {
  const firstLine = text.split("\n").find(Boolean)?.trim();
  if (firstLine && firstLine.length <= 18) {
    return firstLine;
  }

  const titles: Record<LifeCardType, string> = {
    expense: "新的消费记录",
    bill: "新的账单提醒",
    appointment: "新的预约事项",
    shopping: "新的购物信息",
    travel: "新的旅行信息",
    warranty: "新的保修信息",
    todo: "新的待办事项",
    other: "新的生活卡片"
  };

  return titles[type];
}

function normalizeDate(value: string) {
  if (value.includes("月")) {
    const [month, day] = value.replace("日", "").split("月");
    return `2026-${month.padStart(2, "0")}-${day.padStart(2, "0")}T09:00:00+08:00`;
  }

  return `${value.replaceAll("/", "-")}T09:00:00+08:00`;
}

function inferCategory(type: LifeCardType) {
  const categories: Record<LifeCardType, string> = {
    expense: "日常消费",
    bill: "固定账单",
    appointment: "日程",
    shopping: "购物",
    travel: "出行",
    warranty: "物品管理",
    todo: "待办",
    other: "生活"
  };

  return categories[type];
}
