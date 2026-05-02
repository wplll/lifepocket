import AsyncStorage from "@react-native-async-storage/async-storage";
import { LifeList } from "@/types/life";

const KEY = "lifepocket.checklists";

export async function getLists(): Promise<LifeList[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeList).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export async function getListById(id: string): Promise<LifeList | null> {
  const lists = await getLists();
  return lists.find((list) => list.id === id) ?? null;
}

export async function saveList(list: LifeList): Promise<void> {
  const lists = await getLists();
  const next = [normalizeList(list), ...lists.filter((item) => item.id !== list.id)];
  await saveLists(next);
}

export async function updateList(list: LifeList): Promise<void> {
  const normalized = normalizeList({ ...list, updatedAt: new Date().toISOString() });
  const lists = await getLists();
  const next = lists.map((item) => item.id === normalized.id ? normalized : item);
  await saveLists(next.some((item) => item.id === normalized.id) ? next : [normalized, ...lists]);
}

export async function deleteList(id: string): Promise<void> {
  const lists = await getLists();
  await saveLists(lists.filter((list) => list.id !== id));
}

export async function clearLists(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

export async function loadLists(): Promise<LifeList[]> {
  return getLists();
}

export async function addList(list: LifeList) {
  await saveList(list);
  return list;
}

export async function saveLists(lists: LifeList[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(lists.map(normalizeList)));
}

function normalizeList(value: Partial<LifeList>): LifeList {
  const now = new Date().toISOString();
  const createdAt = value.createdAt || now;
  const updatedAt = value.updatedAt || createdAt;
  return {
    id: value.id || `list-${Date.now()}`,
    title: value.title || "未命名清单",
    type: isListType(value.type) ? value.type : "custom",
    summary: value.summary ?? null,
    sourcePrompt: value.sourcePrompt ?? null,
    createdAt,
    updatedAt,
    items: Array.isArray(value.items) ? value.items.map((item, index) => ({
      id: item.id || `list-item-${Date.now()}-${index}`,
      content: item.content || "未命名事项",
      quantity: item.quantity ?? null,
      category: item.category ?? "其他",
      checked: Boolean(item.checked),
      createdAt: item.createdAt || createdAt,
      updatedAt: item.updatedAt || updatedAt
    })) : []
  };
}

function isListType(value: unknown): value is LifeList["type"] {
  return value === "shopping" || value === "travel" || value === "packing" || value === "todo" || value === "custom";
}
