import * as FileSystem from "expo-file-system";
import { CHECKLIST_PROMPT, LIFE_ITEM_EXTRACTION_PROMPT } from "@/prompts/lifePocketPrompts";
import { InternAISettings, LifeChecklist, LifeItem, LifeItemType } from "@/types/life";
import { createId, parseStrictJson } from "@/utils/json";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: unknown;
};

const validTypes: LifeItemType[] = ["expense", "bill", "appointment", "shopping", "travel", "warranty", "todo", "note", "unknown"];

export async function callInternAI(settings: InternAISettings, messages: ChatMessage[]): Promise<string> {
  if (!settings.apiToken.trim()) {
    throw new Error("请先在设置页填写 API Token。");
  }
  if (!settings.endpoint.trim()) {
    throw new Error("请填写 API Endpoint。");
  }

  let response: Response;
  try {
    response = await fetch(settings.endpoint.trim(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiToken.trim()}`
      },
      body: JSON.stringify({
        model: settings.model.trim() || "intern-latest",
        messages
      })
    });
  } catch {
    throw new Error("网络请求失败，请检查网络或 API Endpoint。");
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new Error(`请求失败，HTTP ${response.status}，且返回内容不是 JSON。`);
  }

  if (!response.ok) {
    const message = extractErrorMessage(json);
    throw new Error(`请求失败，HTTP ${response.status}${message ? `：${message}` : ""}`);
  }

  const content = readAssistantContent(json);
  if (!content) {
    throw new Error("模型返回结构不符合预期，未找到 choices[0].message.content。");
  }
  return content;
}

export async function testInternAI(settings: InternAISettings) {
  return callInternAI(settings, [{ role: "user", content: "你好，请用一句中文回复 LifePocket 连接成功。" }]);
}

export async function recognizeText(settings: InternAISettings, text: string): Promise<LifeItem> {
  if (!text.trim()) {
    throw new Error("请先粘贴需要识别的文本。");
  }
  const content = await callInternAI(settings, [
    { role: "user", content: `${LIFE_ITEM_EXTRACTION_PROMPT}\n\n用户文本：\n${text.trim()}` }
  ]);
  return normalizeLifeItem(parseStrictJson<Partial<LifeItem>>(content), { rawText: text });
}

export async function recognizeImage(settings: InternAISettings, imageUri: string, extraText?: string): Promise<LifeItem> {
  const base64 = await imageToBase64(imageUri);
  const content = await callInternAI(settings, [buildImageRecognitionMessage(base64, extraText)]);
  return normalizeLifeItem(parseStrictJson<Partial<LifeItem>>(content), { imageUri });
}

export async function generateChecklist(settings: InternAISettings, scene: string): Promise<LifeChecklist> {
  if (!scene.trim()) {
    throw new Error("请先输入生活场景。");
  }
  const content = await callInternAI(settings, [
    { role: "user", content: `${CHECKLIST_PROMPT}\n\n用户场景：${scene.trim()}` }
  ]);
  const parsed = parseStrictJson<Partial<LifeChecklist>>(content);
  const now = new Date().toISOString();
  return {
    id: createId("list"),
    title: parsed.title || "生活清单",
    type: parsed.type || "custom",
    summary: parsed.summary || scene,
    items: (parsed.items || []).map((item, index) => ({
      id: createId(`list-item-${index}`),
      content: item.content || "未命名事项",
      quantity: item.quantity ?? null,
      category: item.category || "其他",
      checked: Boolean(item.checked)
    })),
    createdAt: now,
    updatedAt: now
  };
}

async function imageToBase64(imageUri: string) {
  const info = await FileSystem.getInfoAsync(imageUri);
  if (!info.exists) {
    throw new Error("图片文件不存在。");
  }
  if (typeof info.size === "number" && info.size > 5 * 1024 * 1024) {
    throw new Error("图片超过 5MB，请选择更小的截图或照片。");
  }
  return FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
}

function buildImageRecognitionMessage(base64Image: string, extraText?: string): ChatMessage {
  return {
    role: "user",
    content: [
      {
        type: "text",
        text: `${LIFE_ITEM_EXTRACTION_PROMPT}\n\n请分析这张图片，并按照指定 JSON Schema 提取生活信息。${extraText ? `\n用户补充：${extraText}` : ""}`
      },
      {
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Image}`
        }
      }
    ]
  };
}

function normalizeLifeItem(item: Partial<LifeItem>, extras: Partial<LifeItem>): LifeItem {
  const now = new Date().toISOString();
  const type = validTypes.includes(item.type as LifeItemType) ? item.type as LifeItemType : "unknown";
  return {
    id: createId("life"),
    type,
    title: item.title || "未命名生活卡片",
    summary: item.summary || "AI 已生成结构化生活信息。",
    amount: typeof item.amount === "number" ? item.amount : null,
    currency: item.currency ?? null,
    date: item.date ?? null,
    dueDate: item.dueDate ?? null,
    eventDateTime: item.eventDateTime ?? null,
    merchant: item.merchant ?? null,
    location: item.location ?? null,
    category: item.category ?? null,
    remindAt: item.remindAt ?? null,
    confidence: typeof item.confidence === "number" ? item.confidence : null,
    todoItems: Array.isArray(item.todoItems) ? item.todoItems : [],
    rawText: item.rawText || extras.rawText || "",
    imageUri: extras.imageUri ?? item.imageUri ?? null,
    status: "active",
    createdAt: now,
    updatedAt: now
  };
}

function readAssistantContent(json: unknown) {
  const value = json as { choices?: Array<{ message?: { content?: unknown } }> };
  const content = value.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
}

function extractErrorMessage(json: unknown) {
  const value = json as { error?: { message?: string }, message?: string };
  return value.error?.message || value.message || "";
}
