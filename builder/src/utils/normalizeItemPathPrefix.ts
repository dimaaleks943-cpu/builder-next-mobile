/**
 * Синхронно с site-runtime-ssr `lib/templateRoute.normalizeItemPathPrefix`:
 * префикс URL записей коллекции на template-странице.
 */
export function normalizeItemPathPrefix(
  slug: string | null | undefined,
): string {
  const t = (slug ?? "").trim()
  if (!t) return "/"
  const withSlash = t.startsWith("/") ? t : `/${t}`
  const trimmed = withSlash.replace(/\/+$/, "") || "/"
  return trimmed
}
