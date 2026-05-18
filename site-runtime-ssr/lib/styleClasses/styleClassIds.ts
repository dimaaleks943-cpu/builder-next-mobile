export const normalizeStyleClassIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((id): id is string => typeof id === "string" && id.length > 0)
}
