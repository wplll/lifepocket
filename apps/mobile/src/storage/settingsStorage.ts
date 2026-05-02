import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { InternAISettings } from "@/types/life";

export const LEGACY_SETTINGS_KEY = "lifepocket.ai.settings";
export const LEGACY_TOKEN_KEY = "lifepocket.ai.token";
export const LEGACY_WEB_TOKEN_KEY = "lifepocket.ai.token.web-preview";

export const defaultSettings: InternAISettings = {
  endpoint: "https://chat.intern-ai.org.cn/api/v1/chat/completions",
  apiToken: "",
  model: "intern-latest"
};

export async function loadSettings(): Promise<InternAISettings> {
  try {
    const [settingsRaw, token] = await Promise.all([
      AsyncStorage.getItem(LEGACY_SETTINGS_KEY),
      getStoredToken(LEGACY_TOKEN_KEY, LEGACY_WEB_TOKEN_KEY)
    ]);
    const settings = parseSettings(settingsRaw);
    return {
      endpoint: settings.endpoint || defaultSettings.endpoint,
      model: settings.model || defaultSettings.model,
      apiToken: token || ""
    };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: InternAISettings) {
  await AsyncStorage.setItem(
    LEGACY_SETTINGS_KEY,
    JSON.stringify({ endpoint: settings.endpoint, model: settings.model })
  );
  if (settings.apiToken.trim()) {
    await setStoredToken(LEGACY_TOKEN_KEY, LEGACY_WEB_TOKEN_KEY, settings.apiToken.trim());
  }
}

export async function clearApiToken() {
  await deleteStoredToken(LEGACY_TOKEN_KEY, LEGACY_WEB_TOKEN_KEY);
}

export function maskToken(token: string) {
  if (!token) return "";
  if (token.length <= 8) return "••••••";
  return `${token.slice(0, 4)}••••${token.slice(-4)}`;
}

export async function getStoredToken(nativeKey: string, webKey?: string) {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(webKey || nativeKey);
  }
  return SecureStore.getItemAsync(nativeKey);
}

export async function setStoredToken(nativeKey: string, webKey: string | undefined, token: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(webKey || nativeKey, token);
    return;
  }
  await SecureStore.setItemAsync(nativeKey, token);
}

export async function deleteStoredToken(nativeKey: string, webKey?: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(webKey || nativeKey);
    return;
  }
  await SecureStore.deleteItemAsync(nativeKey);
}

function parseSettings(settingsRaw: string | null): Omit<InternAISettings, "apiToken"> {
  if (!settingsRaw) return defaultSettings;
  try {
    const parsed = JSON.parse(settingsRaw) as Partial<InternAISettings>;
    return {
      endpoint: typeof parsed.endpoint === "string" ? parsed.endpoint : defaultSettings.endpoint,
      model: typeof parsed.model === "string" ? parsed.model : defaultSettings.model
    };
  } catch {
    return defaultSettings;
  }
}
