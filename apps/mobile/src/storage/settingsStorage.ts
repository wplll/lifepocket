import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { InternAISettings } from "@/types/life";

const SETTINGS_KEY = "lifepocket.ai.settings";
const TOKEN_KEY = "lifepocket.ai.token";
const WEB_TOKEN_KEY = "lifepocket.ai.token.web-preview";

export const defaultSettings: InternAISettings = {
  endpoint: "https://chat.intern-ai.org.cn/api/v1/chat/completions",
  apiToken: "",
  model: "intern-latest"
};

export async function loadSettings(): Promise<InternAISettings> {
  const [settingsRaw, token] = await Promise.all([
    AsyncStorage.getItem(SETTINGS_KEY),
    getStoredToken()
  ]);
  const settings = settingsRaw ? JSON.parse(settingsRaw) as Omit<InternAISettings, "apiToken"> : defaultSettings;
  return {
    endpoint: settings.endpoint || defaultSettings.endpoint,
    model: settings.model || defaultSettings.model,
    apiToken: token || ""
  };
}

export async function saveSettings(settings: InternAISettings) {
  await AsyncStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({ endpoint: settings.endpoint, model: settings.model })
  );
  if (settings.apiToken.trim()) {
    await setStoredToken(settings.apiToken.trim());
  }
}

export async function clearApiToken() {
  await deleteStoredToken();
}

export function maskToken(token: string) {
  if (!token) return "";
  if (token.length <= 8) return "••••••";
  return `${token.slice(0, 4)}••••••${token.slice(-4)}`;
}

async function getStoredToken() {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(WEB_TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function setStoredToken(token: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(WEB_TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function deleteStoredToken() {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(WEB_TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
