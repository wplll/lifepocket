export type LifeCardType =
  | "expense"
  | "bill"
  | "appointment"
  | "shopping"
  | "travel"
  | "warranty"
  | "todo"
  | "other";

export type LifeCard = {
  id: string;
  type: LifeCardType;
  title: string;
  summary: string;
  amount?: number;
  currency?: string;
  occurredAt?: string;
  reminderAt?: string;
  place?: string;
  merchant?: string;
  category?: string;
  sourceKind: "text" | "image";
  sourceText?: string;
};

export type Reminder = {
  id: string;
  cardId: string;
  title: string;
  remindAt: string;
  status: "pending" | "done" | "dismissed";
};

export type Checklist = {
  id: string;
  kind: "shopping" | "travel" | "outing";
  title: string;
  items: string[];
};

export const typeLabels: Record<LifeCardType, string> = {
  expense: "消费记录",
  bill: "账单",
  appointment: "预约",
  shopping: "购物",
  travel: "旅行",
  warranty: "保修",
  todo: "待办",
  other: "其他"
};

export const demoCards: LifeCard[] = [
  {
    id: "card-1",
    type: "expense",
    title: "山姆会员店采购",
    summary: "食品、清洁用品和牛奶，适合记入家庭日用品。",
    amount: 286.5,
    currency: "CNY",
    occurredAt: "2026-05-01T10:18:00+08:00",
    merchant: "山姆会员店",
    category: "日用品",
    sourceKind: "image"
  },
  {
    id: "card-2",
    type: "bill",
    title: "5 月房租账单",
    summary: "房租需在 5 月 5 日前支付，包含物业费。",
    amount: 4200,
    currency: "CNY",
    occurredAt: "2026-05-01T09:00:00+08:00",
    reminderAt: "2026-05-04T20:00:00+08:00",
    merchant: "房东",
    category: "居住",
    sourceKind: "text"
  },
  {
    id: "card-3",
    type: "appointment",
    title: "牙科复诊",
    summary: "周六下午到诊所复查牙齿矫正进度。",
    occurredAt: "2026-05-02T15:30:00+08:00",
    reminderAt: "2026-05-02T13:30:00+08:00",
    place: "恒雅口腔",
    category: "健康",
    sourceKind: "text"
  },
  {
    id: "card-4",
    type: "travel",
    title: "杭州周末行程",
    summary: "高铁往返，入住湖滨附近酒店，需要准备身份证和充电器。",
    amount: 612,
    currency: "CNY",
    occurredAt: "2026-05-10T08:12:00+08:00",
    place: "杭州",
    category: "出行",
    sourceKind: "image"
  }
];

export const demoReminders: Reminder[] = demoCards
  .filter((card) => card.reminderAt)
  .map((card) => ({
    id: `reminder-${card.id}`,
    cardId: card.id,
    title: card.title,
    remindAt: card.reminderAt as string,
    status: "pending"
  }));

export const demoChecklists: Checklist[] = [
  {
    id: "list-1",
    kind: "shopping",
    title: "本周补货清单",
    items: ["鸡蛋", "牛奶", "洗衣液", "纸巾", "水果"]
  },
  {
    id: "list-2",
    kind: "travel",
    title: "杭州周末旅行",
    items: ["身份证", "充电器", "雨伞", "换洗衣物", "常用药"]
  },
  {
    id: "list-3",
    kind: "outing",
    title: "出门前检查",
    items: ["钥匙", "手机", "耳机", "钱包", "关闭电源"]
  }
];
