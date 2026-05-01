export function parseStrictJson<T>(content: string): T {
  const trimmed = content.trim();
  const unwrapped = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(unwrapped) as T;
  } catch {
    const match = unwrapped.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("模型返回的内容不是 JSON。");
    }
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      throw new Error("模型返回的 JSON 无法解析。");
    }
  }
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
