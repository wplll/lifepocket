export function parseStrictJson<T>(content: string): T {
  const unwrapped = unwrapJson(content);
  try {
    return JSON.parse(unwrapped) as T;
  } catch {
    const objectMatch = unwrapped.match(/\{[\s\S]*\}/);
    const arrayMatch = unwrapped.match(/\[[\s\S]*\]/);
    const match = objectMatch?.[0] || arrayMatch?.[0];
    if (!match) {
      throw new Error("模型返回的内容不是 JSON，请重试或补充更清晰的文字。");
    }
    try {
      return JSON.parse(match) as T;
    } catch {
      throw new Error("模型返回的 JSON 无法解析，请重试。");
    }
  }
}

export function unwrapJson(content: string) {
  return content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
