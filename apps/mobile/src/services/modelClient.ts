import { getDefaultModelConfig, testConfigWithToken } from "@/storage/modelConfigsStorage";
import { ModelConfig, ModelConfigWithToken } from "@/types/life";

export type ModelMessage = {
  role: "system" | "user" | "assistant";
  content: unknown;
};

const TEXT_REQUEST_TIMEOUT_MS = 45_000;
const IMAGE_REQUEST_TIMEOUT_MS = 90_000;

export async function callSelectedModel(options: {
  messages: ModelMessage[];
  requireVision?: boolean;
  timeoutMs?: number;
}): Promise<string> {
  const config = await getDefaultModelConfig();
  if (!config) {
    throw new Error("还没有默认模型，请先在设置页添加或选择模型配置。");
  }
  return callModel(config, options.messages, {
    requireVision: options.requireVision,
    timeoutMs: options.timeoutMs
  });
}

export async function callModel(
  config: ModelConfigWithToken,
  messages: ModelMessage[],
  options: { requireVision?: boolean; timeoutMs?: number } = {}
): Promise<string> {
  if (!config.apiToken.trim()) {
    throw new Error("当前模型没有 API Token，请先在设置页填写并保存。");
  }
  if (!config.endpoint.trim()) {
    throw new Error("当前模型没有 API Endpoint，请先在设置页填写。");
  }
  if (options.requireVision && !config.supportsVision) {
    throw new Error("当前模型未开启图片识别能力，请在设置中选择支持视觉输入的模型，或改用文字识别。");
  }

  const timeoutMs = options.timeoutMs || (options.requireVision ? IMAGE_REQUEST_TIMEOUT_MS : TEXT_REQUEST_TIMEOUT_MS);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(config.endpoint.trim(), {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiToken.trim()}`
      },
      body: JSON.stringify(buildRequestBody(config.model, messages))
    });
  } catch (error) {
    clearTimeout(timeoutId);
    if (isAbortError(error)) {
      throw new Error(options.requireVision ? "模型图片请求超时，请稍后重试或换一张更小的图片。" : "模型请求超时，请稍后重试。");
    }
    throw new Error("网络请求失败，请检查网络、API Endpoint 或模型服务状态。");
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    clearTimeout(timeoutId);
    throw new Error(`请求失败，HTTP ${response.status}，返回内容不是 JSON。`);
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    const message = extractErrorMessage(json);
    throw new Error(`请求失败，HTTP ${response.status}${message ? `：${message}` : ""}`);
  }

  const content = readAssistantContent(json);
  if (!content.trim()) {
    throw new Error("模型返回为空，请检查当前模型配置或重试。");
  }
  return content;
}

export async function testModelConnection(config: ModelConfig, apiToken?: string) {
  const configWithToken = await testConfigWithToken(config, apiToken);
  return callModel(configWithToken, [{ role: "user", content: "你好，请回复“连接成功”。" }]);
}

export function buildVisionUserMessage(text: string, base64Image: string, mimeType: string): ModelMessage {
  return {
    role: "user",
    content: [
      { type: "text", text },
      {
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${base64Image}` }
      }
    ]
  };
}

function buildRequestBody(model: string, messages: ModelMessage[]) {
  const modelName = model.trim() || "intern-latest";
  const body: {
    model: string;
    messages: ModelMessage[];
    temperature: number;
    top_p: number;
    max_tokens: number;
    thinking_mode?: boolean;
  } = {
    model: modelName,
    messages,
    temperature: 0.2,
    top_p: 0.9,
    max_tokens: 1800
  };

  if (modelName === "intern-latest" || modelName.startsWith("intern-s1")) {
    body.thinking_mode = false;
  }

  return body;
}

function readAssistantContent(json: unknown) {
  const value = json as { choices?: Array<{ message?: { content?: unknown } }> };
  const content = value.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
}

function extractErrorMessage(json: unknown) {
  const value = json as { error?: { message?: string }; message?: string };
  return value.error?.message || value.message || "";
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}
