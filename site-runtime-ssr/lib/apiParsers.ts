export function parseSingleEntityJson<T extends { id: string }>(
  json: unknown,
): T | null {
  if (!json || typeof json !== "object") return null

  const o = json as Record<string, unknown>
  if (o.data != null && typeof o.data === "object" && !Array.isArray(o.data)) {
    const inner = o.data as Record<string, unknown>
    if (typeof inner.id === "string") return o.data as T
  }

  if (typeof o.id === "string") return json as T
  return null
}
