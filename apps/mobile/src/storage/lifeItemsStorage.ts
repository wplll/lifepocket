import AsyncStorage from "@react-native-async-storage/async-storage";
import { LifeItem } from "@/types/life";

const KEY = "lifepocket.lifeItems";

export async function loadLifeItems(): Promise<LifeItem[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) as LifeItem[] : [];
}

export async function saveLifeItems(items: LifeItem[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

export async function upsertLifeItem(item: LifeItem) {
  const items = await loadLifeItems();
  const next = [item, ...items.filter((existing) => existing.id !== item.id)];
  await saveLifeItems(next);
  return item;
}

export async function updateLifeItem(id: string, patch: Partial<LifeItem>) {
  const items = await loadLifeItems();
  const now = new Date().toISOString();
  const next = items.map((item) => item.id === id ? { ...item, ...patch, updatedAt: now } : item);
  await saveLifeItems(next);
  return next.find((item) => item.id === id) ?? null;
}

export async function getLifeItem(id: string) {
  const items = await loadLifeItems();
  return items.find((item) => item.id === id) ?? null;
}
