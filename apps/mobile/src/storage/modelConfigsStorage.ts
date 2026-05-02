import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LEGACY_TOKEN_KEY,
  LEGACY_WEB_TOKEN_KEY,
  defaultSettings,
  deleteStoredToken,
  getStoredToken,
  loadSettings,
  setStoredToken
} from "@/storage/settingsStorage";
import { ModelConfig, ModelConfigWithToken, ModelProviderType } from "@/types/life";
import { createId } from "@/utils/json";

const MODEL_CONFIGS_KEY = "lifepocket.ai.modelConfigs";
const DEFAULT_MODEL_ID_KEY = "lifepocket.ai.defaultModelConfigId";
const TOKEN_PREFIX = "lifepocket.ai.model.token.";
const WEB_TOKEN_PREFIX = "lifepocket.ai.model.token.web.";

const providerTypes: ModelProviderType[] = ["internlm", "openai_compatible", "custom"];

export async function getModelConfigs(): Promise<ModelConfig[]> {
  const configs = await readConfigs();
  if (configs.length > 0) return normalizeDefaults(configs);
  return migrateLegacySettings();
}

export async function getDefaultModelConfig(): Promise<ModelConfigWithToken | null> {
  const configs = await getModelConfigs();
  const selected = configs.find((config) => config.isDefault) || configs[0];
  if (!selected) return null;
  return withToken(selected);
}

export async function saveModelConfig(config: ModelConfig, apiToken?: string) {
  const configs = await getModelConfigs();
  const next = normalizeDefaults([
    sanitizeConfig(config),
    ...configs.filter((item) => item.id !== config.id)
  ]);
  await AsyncStorage.setItem(MODEL_CONFIGS_KEY, JSON.stringify(next));
  if (config.isDefault) {
    await AsyncStorage.setItem(DEFAULT_MODEL_ID_KEY, config.id);
  }
  if (apiToken?.trim()) {
    await setStoredToken(config.tokenStorageKey, webTokenKey(config.tokenStorageKey), apiToken.trim());
  }
}

export async function deleteModelConfig(id: string) {
  const configs = await getModelConfigs();
  const target = configs.find((config) => config.id === id);
  const remaining = configs.filter((config) => config.id !== id);
  if (target) {
    await deleteStoredToken(target.tokenStorageKey, webTokenKey(target.tokenStorageKey));
  }
  const next = normalizeDefaults(remaining);
  await AsyncStorage.setItem(MODEL_CONFIGS_KEY, JSON.stringify(next));
  const defaultConfig = next.find((config) => config.isDefault);
  if (defaultConfig) {
    await AsyncStorage.setItem(DEFAULT_MODEL_ID_KEY, defaultConfig.id);
  } else {
    await AsyncStorage.removeItem(DEFAULT_MODEL_ID_KEY);
  }
}

export async function setDefaultModelConfig(id: string) {
  const configs = await getModelConfigs();
  const next = configs.map((config) => ({
    ...config,
    isDefault: config.id === id,
    updatedAt: config.id === id ? new Date().toISOString() : config.updatedAt
  }));
  await AsyncStorage.setItem(MODEL_CONFIGS_KEY, JSON.stringify(next));
  await AsyncStorage.setItem(DEFAULT_MODEL_ID_KEY, id);
}

export async function testConfigWithToken(config: ModelConfig, apiToken?: string): Promise<ModelConfigWithToken> {
  const token = apiToken?.trim() || await getStoredToken(config.tokenStorageKey, webTokenKey(config.tokenStorageKey)) || "";
  return { ...sanitizeConfig(config), apiToken: token };
}

export function createEmptyModelConfig(): ModelConfig {
  const now = new Date().toISOString();
  const id = createId("model");
  return {
    id,
    name: "书生模型",
    provider: "internlm",
    endpoint: defaultSettings.endpoint,
    model: defaultSettings.model,
    tokenStorageKey: `${TOKEN_PREFIX}${id}`,
    supportsVision: true,
    isDefault: false,
    createdAt: now,
    updatedAt: now
  };
}

async function migrateLegacySettings() {
  const legacy = await loadSettings();
  const now = new Date().toISOString();
  const id = "model-internlm-default";
  const tokenStorageKey = `${TOKEN_PREFIX}${id}`;
  const legacyToken = legacy.apiToken || await getStoredToken(LEGACY_TOKEN_KEY, LEGACY_WEB_TOKEN_KEY) || "";
  if (legacyToken) {
    await setStoredToken(tokenStorageKey, webTokenKey(tokenStorageKey), legacyToken);
  }
  const config: ModelConfig = {
    id,
    name: "书生模型",
    provider: "internlm",
    endpoint: legacy.endpoint || defaultSettings.endpoint,
    model: legacy.model || defaultSettings.model,
    tokenStorageKey,
    supportsVision: true,
    isDefault: true,
    createdAt: now,
    updatedAt: now
  };
  await AsyncStorage.setItem(MODEL_CONFIGS_KEY, JSON.stringify([config]));
  await AsyncStorage.setItem(DEFAULT_MODEL_ID_KEY, id);
  return [config];
}

async function withToken(config: ModelConfig): Promise<ModelConfigWithToken> {
  const apiToken = await getStoredToken(config.tokenStorageKey, webTokenKey(config.tokenStorageKey)) || "";
  return { ...config, apiToken };
}

async function readConfigs(): Promise<ModelConfig[]> {
  try {
    const raw = await AsyncStorage.getItem(MODEL_CONFIGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeConfig).filter(Boolean);
  } catch {
    return [];
  }
}

function sanitizeConfig(value: unknown): ModelConfig {
  const now = new Date().toISOString();
  const input = value as Partial<ModelConfig>;
  const id = typeof input.id === "string" && input.id ? input.id : createId("model");
  const tokenStorageKey = typeof input.tokenStorageKey === "string" && input.tokenStorageKey
    ? input.tokenStorageKey
    : `${TOKEN_PREFIX}${id}`;
  const provider = providerTypes.includes(input.provider as ModelProviderType) ? input.provider as ModelProviderType : "custom";
  return {
    id,
    name: text(input.name) || providerLabel(provider),
    provider,
    endpoint: text(input.endpoint) || defaultSettings.endpoint,
    model: text(input.model) || defaultSettings.model,
    tokenStorageKey,
    supportsVision: Boolean(input.supportsVision),
    isDefault: Boolean(input.isDefault),
    createdAt: text(input.createdAt) || now,
    updatedAt: text(input.updatedAt) || now
  };
}

function normalizeDefaults(configs: ModelConfig[]) {
  if (configs.length === 0) return [];
  const defaultId = configs.find((config) => config.isDefault)?.id || configs[0].id;
  return configs.map((config) => ({ ...config, isDefault: config.id === defaultId }));
}

function webTokenKey(nativeKey: string) {
  return nativeKey.replace(TOKEN_PREFIX, WEB_TOKEN_PREFIX);
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function providerLabel(provider: ModelProviderType) {
  if (provider === "internlm") return "书生模型";
  if (provider === "openai_compatible") return "OpenAI 兼容接口";
  return "自定义模型";
}
