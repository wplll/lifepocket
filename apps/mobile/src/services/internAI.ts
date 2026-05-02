import * as FileSystem from "expo-file-system";
import { CHECKLIST_PROMPT, LIFE_ITEM_EXTRACTION_PROMPT } from "@/prompts/lifePocketPrompts";
import { buildVisionUserMessage, callModel, callSelectedModel, ModelMessage } from "@/services/modelClient";
import { InternAISettings, LifeItem, LifeItemType, LifeList, LifeListType, ModelConfigWithToken } from "@/types/life";
import { createId, parseStrictJson, unwrapJson } from "@/utils/json";

const validTypes: LifeItemType[] = ["expense", "bill", "appointment", "shopping", "travel", "warranty", "todo", "note", "unknown"];
const validListTypes: LifeListType[] = ["shopping", "travel", "packing", "todo", "custom"];
const IMAGE_REQUEST_TIMEOUT_MS = 90_000;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

export async function callInternAI(settings: InternAISettings, messages: ModelMessage[], timeoutMs?: number): Promise<string> {
  const config: ModelConfigWithToken = {
    id: "legacy-internlm",
    name: "书生模型",
    provider: "internlm",
    endpoint: settings.endpoint,
    model: settings.model,
    tokenStorageKey: "lifepocket.ai.token",
    supportsVision: true,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    apiToken: settings.apiToken
  };
  return callModel(config, messages, { timeoutMs });
}

export async function testInternAI(settings: InternAISettings) {
  return callInternAI(settings, [{ role: "user", content: "你好，请回复“连接成功”。" }]);
}

export async function recognizeText(_settings: InternAISettings | null, text: string): Promise<LifeItem[]> {
  if (!text.trim()) {
    throw new Error("请先粘贴需要识别的文本。");
  }
  const content = await callSelectedModel({
    messages: [
      { role: "user", content: `${LIFE_ITEM_EXTRACTION_PROMPT}\n\n用户文本：\n${text.trim()}` }
    ]
  });
  return parseLifeItemsFromAIResponse(content, { rawText: text });
}

export async function recognizeImage(
  _settings: InternAISettings | null,
  imageUri: string,
  extraText?: string,
  mimeType?: string,
  imageTimeAnchorIso?: string
): Promise<LifeItem[]> {
  const image = await imageToBase64(imageUri, mimeType);
  const timeAnchor = imageTimeAnchorIso || image.timeAnchorIso || new Date().toISOString();
  const content = await callSelectedModel({
    messages: [buildImageRecognitionMessage(image.base64, image.mimeType, timeAnchor, extraText)],
    requireVision: true,
    timeoutMs: IMAGE_REQUEST_TIMEOUT_MS
  });
  const items = parseLifeItemsFromAIResponse(content, { imageUri });
  return items.map((item) => resolveRelativeDates(item, timeAnchor));
}

export async function generateChecklist(_settings: InternAISettings | null, scene: string): Promise<LifeList> {
  if (!scene.trim()) {
    throw new Error("请先输入生活场景。");
  }
  const content = await callSelectedModel({
    messages: [
      { role: "user", content: `${CHECKLIST_PROMPT}\n\n用户场景：${scene.trim()}` }
    ]
  });
  const parsed = parseStrictJson<Partial<LifeList>>(content);
  const now = new Date().toISOString();
  const type = validListTypes.includes(parsed.type as LifeListType) ? parsed.type as LifeListType : "custom";
  return {
    id: createId("list"),
    title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : "生活清单",
    type,
    summary: typeof parsed.summary === "string" ? parsed.summary : scene.trim(),
    sourcePrompt: scene.trim(),
    items: Array.isArray(parsed.items) ? parsed.items.map((item, index) => ({
      id: createId(`list-item-${index}`),
      content: item.content || "未命名事项",
      quantity: item.quantity ?? null,
      category: item.category || "其他",
      checked: Boolean(item.checked),
      createdAt: now,
      updatedAt: now
    })) : [],
    createdAt: now,
    updatedAt: now
  };
}

export function parseLifeItemsFromAIResponse(content: string, extras: Partial<LifeItem> = {}): LifeItem[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(unwrapJson(content));
  } catch {
    parsed = parseStrictJson<unknown>(content);
  }

  const candidates = toLifeItemCandidates(parsed);
  if (candidates.length === 0) {
    throw new Error("没有识别到可保存的生活卡片，请换一张更清晰的图片或补充文字说明。");
  }
  return candidates.map((candidate) => normalizeLifeItem(candidate, extras));
}

export async function imageToBase64(imageUri: string, providedMimeType?: string) {
  const info = await FileSystem.getInfoAsync(imageUri);
  if (!info.exists) {
    throw new Error("图片文件不存在。");
  }
  if (typeof info.size === "number" && info.size > MAX_IMAGE_BYTES) {
    throw new Error("图片超过 3MB，请先裁剪截图或选择更小的图片再发送。");
  }
  const mimeType = normalizeMimeType(providedMimeType) || inferMimeType(imageUri) || "image/jpeg";
  const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
  return { base64, mimeType, timeAnchorIso: readFileTimeAnchor(info) };
}

function toLifeItemCandidates(parsed: unknown): Array<Partial<LifeItem>> {
  if (Array.isArray(parsed)) return parsed as Array<Partial<LifeItem>>;
  if (parsed && typeof parsed === "object") {
    const value = parsed as { items?: unknown };
    if (Array.isArray(value.items)) return value.items as Array<Partial<LifeItem>>;
    return [parsed as Partial<LifeItem>];
  }
  return [];
}

function buildImageRecognitionMessage(base64Image: string, mimeType: string, timeAnchorIso: string, extraText?: string): ModelMessage {
  const anchor = formatAnchorForPrompt(timeAnchorIso);
  return buildVisionUserMessage(
    `${LIFE_ITEM_EXTRACTION_PROMPT}\n\n请分析这张图片，并按指定 JSON 格式提取生活信息。\n时间锚点：${anchor}。如果图片中出现“今天、昨天、明天、周一、下周”等相对日期，请以这个时间锚点换算成具体日期后再返回 JSON。${extraText ? `\n用户补充：${extraText}` : ""}`,
    base64Image,
    mimeType
  );
}

function readFileTimeAnchor(info: FileSystem.FileInfo) {
  const modifiedAt = "modificationTime" in info ? info.modificationTime : undefined;
  if (typeof modifiedAt !== "number") return undefined;
  const date = new Date(modifiedAt > 10_000_000_000 ? modifiedAt : modifiedAt * 1000);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function formatAnchorForPrompt(timeAnchorIso: string) {
  const date = new Date(timeAnchorIso);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  const datePart = date.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "long" });
  const timePart = date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  return `${datePart} ${timePart}`;
}

function resolveRelativeDates(item: LifeItem, timeAnchorIso: string): LifeItem {
  return {
    ...item,
    date: resolveRelativeDateValue(item.date, timeAnchorIso, false),
    dueDate: resolveRelativeDateValue(item.dueDate, timeAnchorIso, false),
    eventDateTime: resolveRelativeDateValue(item.eventDateTime, timeAnchorIso, true),
    remindAt: resolveRelativeDateValue(item.remindAt, timeAnchorIso, true)
  };
}

function resolveRelativeDateValue(value: string | null | undefined, timeAnchorIso: string, keepTime: boolean) {
  if (!value) return value;
  const offset = getRelativeDayOffset(value);
  if (offset === null) return value;
  const anchor = new Date(timeAnchorIso);
  if (Number.isNaN(anchor.getTime())) return value;
  anchor.setDate(anchor.getDate() + offset);
  const date = formatDatePart(anchor);
  if (!keepTime) return date;
  const time = value.match(/(\d{1,2})[:：](\d{2})/)?.slice(1, 3).join(":") || formatTimePart(anchor);
  return `${date} ${time}`;
}

function getRelativeDayOffset(value: string) {
  if (value.includes("前天")) return -2;
  if (value.includes("昨天") || value.includes("昨日")) return -1;
  if (value.includes("今天") || value.includes("今日")) return 0;
  if (value.includes("明天") || value.includes("明日")) return 1;
  if (value.includes("后天")) return 2;
  return null;
}

function formatDatePart(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimePart(date: Date) {
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function normalizeLifeItem(item: Partial<LifeItem>, extras: Partial<LifeItem>): LifeItem {
  const now = new Date().toISOString();
  const type = validTypes.includes(item.type as LifeItemType) ? item.type as LifeItemType : "unknown";
  return {
    id: item.id || createId("life"),
    type,
    title: asText(item.title) || defaultTitle(type),
    summary: asText(item.summary) || "AI 已生成结构化生活信息。",
    amount: normalizeAmount(item.amount),
    currency: asText(item.currency) || null,
    date: asText(item.date) || null,
    dueDate: asText(item.dueDate) || null,
    eventDateTime: asText(item.eventDateTime) || null,
    merchant: asText(item.merchant) || null,
    location: asText(item.location) || null,
    category: asText(item.category) || null,
    remindAt: asText(item.remindAt) || null,
    confidence: typeof item.confidence === "number" ? item.confidence : null,
    todoItems: Array.isArray(item.todoItems) ? item.todoItems.filter((todo): todo is string => typeof todo === "string") : [],
    rawText: asText(item.rawText) || extras.rawText || "",
    imageUri: extras.imageUri ?? item.imageUri ?? null,
    status: item.status === "done" || item.status === "archived" ? item.status : "active",
    createdAt: item.createdAt || now,
    updatedAt: now
  };
}

function normalizeAmount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function defaultTitle(type: LifeItemType) {
  if (type === "expense") return "未命名消费记录";
  if (type === "bill") return "未命名账单";
  if (type === "appointment") return "未命名预约";
  return "未命名生活卡片";
}

function inferMimeType(uri: string) {
  const normalized = uri.split("?")[0].toLowerCase();
  if (normalized.endsWith(".heic") || normalized.endsWith(".heif")) {
    throw new Error("暂不支持 HEIC/HEIF 图片，请在相册中转为 JPG 或截图后再识别。");
  }
  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) return "image/jpeg";
  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".webp")) return "image/webp";
  return "";
}

function normalizeMimeType(mimeType?: string) {
  if (mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/webp") {
    return mimeType;
  }
  if (mimeType === "image/heic" || mimeType === "image/heif") {
    throw new Error("暂不支持 HEIC/HEIF 图片，请在相册中转为 JPG 或截图后再识别。");
  }
  return "";
}
