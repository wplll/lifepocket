import AsyncStorage from "@react-native-async-storage/async-storage";
import { isLifeItemStatus, isLifeItemType } from "@/constants/lifeItemMeta";
import { LifeItem } from "@/types/life";

const KEY = "lifepocket.lifeItems";

export async function loadLifeItems(): Promise<LifeItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeLifeItem) : [];
  } catch {
    return [];
  }
}

export async function saveLifeItems(items: LifeItem[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items.map(normalizeLifeItem)));
}

export async function upsertLifeItem(item: LifeItem) {
  const items = await loadLifeItems();
  const next = [item, ...items.filter((existing) => existing.id !== item.id)];
  await saveLifeItems(next);
  return item;
}

export async function upsertLifeItems(newItems: LifeItem[]) {
  if (newItems.length === 0) return [];
  const items = await loadLifeItems();
  const incomingIds = new Set(newItems.map((item) => item.id));
  const next = [...newItems, ...items.filter((existing) => !incomingIds.has(existing.id))];
  await saveLifeItems(next);
  return newItems;
}

export async function updateLifeItem(id: string, patch: Partial<LifeItem>) {
  const items = await loadLifeItems();
  const now = new Date().toISOString();
  const next = items.map((item) => item.id === id ? { ...item, ...patch, updatedAt: now } : item);
  await saveLifeItems(next);
  return next.find((item) => item.id === id) ?? null;
}

export async function deleteLifeItem(id: string) {
  const items = await loadLifeItems();
  const next = items.filter((item) => item.id !== id);
  await saveLifeItems(next);
  return next.length !== items.length;
}

export async function getLifeItem(id: string) {
  const items = await loadLifeItems();
  return items.find((item) => item.id === id) ?? null;
}

function normalizeLifeItem(value: Partial<LifeItem>): LifeItem {
  const now = new Date().toISOString();
  const createdAt = typeof value.createdAt === "string" ? value.createdAt : now;
  return {
    id: typeof value.id === "string" && value.id ? value.id : `life-${Date.now()}`,
    type: isLifeItemType(value.type) ? value.type : "unknown",
    title: typeof value.title === "string" && value.title ? value.title : "未命名生活卡片",
    summary: typeof value.summary === "string" ? value.summary : "旧数据已兼容为生活卡片。",
    amount: typeof value.amount === "number" ? value.amount : null,
    currency: typeof value.currency === "string" ? value.currency : null,
    date: typeof value.date === "string" ? value.date : null,
    dueDate: typeof value.dueDate === "string" ? value.dueDate : null,
    eventDateTime: typeof value.eventDateTime === "string" ? value.eventDateTime : null,
    merchant: typeof value.merchant === "string" ? value.merchant : null,
    location: typeof value.location === "string" ? value.location : null,
    category: typeof value.category === "string" ? value.category : null,
    remindAt: typeof value.remindAt === "string" ? value.remindAt : null,
    confidence: typeof value.confidence === "number" ? value.confidence : null,
    todoItems: Array.isArray(value.todoItems) ? value.todoItems.filter((item): item is string => typeof item === "string") : [],
    rawText: typeof value.rawText === "string" ? value.rawText : "",
    imageUri: typeof value.imageUri === "string" ? value.imageUri : null,
    status: isLifeItemStatus(value.status) ? value.status : "active",
    createdAt,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : createdAt
  };
}
