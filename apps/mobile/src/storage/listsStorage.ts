import AsyncStorage from "@react-native-async-storage/async-storage";
import { LifeChecklist } from "@/types/life";

const KEY = "lifepocket.checklists";

export async function loadLists(): Promise<LifeChecklist[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) as LifeChecklist[] : [];
}

export async function saveLists(lists: LifeChecklist[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(lists));
}

export async function addList(list: LifeChecklist) {
  const lists = await loadLists();
  const next = [list, ...lists];
  await saveLists(next);
  return list;
}

export async function updateList(list: LifeChecklist) {
  const lists = await loadLists();
  const next = lists.map((item) => item.id === list.id ? list : item);
  await saveLists(next);
}
