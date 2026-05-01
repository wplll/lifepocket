export type LifeItemType =
  | "expense"
  | "bill"
  | "appointment"
  | "shopping"
  | "travel"
  | "warranty"
  | "todo"
  | "note"
  | "unknown";

export type LifeItemStatus = "active" | "done" | "archived";

export type LifeItem = {
  id: string;
  type: LifeItemType;
  title: string;
  summary: string;
  amount?: number | null;
  currency?: string | null;
  date?: string | null;
  dueDate?: string | null;
  eventDateTime?: string | null;
  merchant?: string | null;
  location?: string | null;
  category?: string | null;
  remindAt?: string | null;
  confidence?: number | null;
  todoItems?: string[];
  rawText?: string;
  imageUri?: string | null;
  status: LifeItemStatus;
  createdAt: string;
  updatedAt: string;
};

export type ChecklistItem = {
  id: string;
  content: string;
  quantity?: string | null;
  category: string;
  checked: boolean;
};

export type LifeChecklist = {
  id: string;
  title: string;
  type: "shopping" | "travel" | "packing" | "todo" | "custom";
  summary: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
};

export type InternAISettings = {
  endpoint: string;
  apiToken: string;
  model: string;
};

export const typeLabels: Record<LifeItemType, string> = {
  expense: "消费",
  bill: "账单",
  appointment: "预约",
  shopping: "购物",
  travel: "旅行",
  warranty: "保修",
  todo: "待办",
  note: "备忘",
  unknown: "未知"
};
