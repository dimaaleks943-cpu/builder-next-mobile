export const DEFAULT_LOCALE = "ru" as const

export const LOCALE_PREFIXES = ["en"] as const

export type PrefixedLocale = (typeof LOCALE_PREFIXES)[number]

export type SsrLocale = typeof DEFAULT_LOCALE | PrefixedLocale

const isPrefixedLocale = (value: string): value is PrefixedLocale =>
  (LOCALE_PREFIXES as readonly string[]).includes(value)
//TODO достаю локаль из урла,после релизации локализации, мы должны сравнивать с массивом доступных языков
export const parseLocaleFromSlugPath = (
  slugPath: string,
): { locale: SsrLocale; slugPathWithoutLocale: string } => {
  const trimmed = slugPath.trim()
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  const noTrailing = withSlash.replace(/\/+$/, "") || "/"
  const inner = noTrailing === "/" ? "" : noTrailing.slice(1)
  const segments = inner.split("/").filter(Boolean)
  if (segments.length === 0) {
    return { locale: DEFAULT_LOCALE, slugPathWithoutLocale: "/" }
  }
  const first = segments[0]!
  if (!isPrefixedLocale(first)) {
    return { locale: DEFAULT_LOCALE, slugPathWithoutLocale: noTrailing }
  }
  const rest = segments.slice(1)
  const slugPathWithoutLocale =
    rest.length === 0 ? "/" : `/${rest.join("/")}`
  return { locale: first, slugPathWithoutLocale }
}

export const prefixPublicPath = (path: string, locale: SsrLocale): string => {
  if (locale === DEFAULT_LOCALE) {
    return path.startsWith("/") ? path : `/${path}`
  }
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `/${locale}${normalized === "/" ? "" : normalized}`
}
