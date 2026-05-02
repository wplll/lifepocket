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

export type LifeListType = "shopping" | "travel" | "packing" | "todo" | "custom";

export type LifeListItem = {
  id: string;
  content: string;
  quantity?: string | null;
  category?: string | null;
  checked: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LifeList = {
  id: string;
  title: string;
  type: LifeListType;
  summary?: string | null;
  sourcePrompt?: string | null;
  items: LifeListItem[];
  createdAt: string;
  updatedAt: string;
};

export type ChecklistItem = LifeListItem;
export type LifeChecklist = LifeList;

export type InternAISettings = {
  endpoint: string;
  apiToken: string;
  model: string;
};

export type ModelProviderType = "internlm" | "openai_compatible" | "custom";

export type ModelConfig = {
  id: string;
  name: string;
  provider: ModelProviderType;
  endpoint: string;
  model: string;
  tokenStorageKey: string;
  supportsVision: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ModelConfigWithToken = ModelConfig & {
  apiToken: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  imageUri?: string | null;
  createdAt: string;
};
