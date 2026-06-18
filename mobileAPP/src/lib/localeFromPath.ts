export const DEFAULT_LOCALE = "ru" as const;

export const LOCALE_PREFIXES = ["en"] as const;

export type PrefixedLocale = (typeof LOCALE_PREFIXES)[number];

export type SsrLocale = typeof DEFAULT_LOCALE | PrefixedLocale;

const isPrefixedLocale = (value: string): value is PrefixedLocale =>
  (LOCALE_PREFIXES as readonly string[]).includes(value);

export const parseLocaleFromSlugPath = (
  slugPath: string,
): { locale: SsrLocale; slugPathWithoutLocale: string } => {
  const trimmed = slugPath.trim();
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const noTrailing = withSlash.replace(/\/+$/, "") || "/";
  const inner = noTrailing === "/" ? "" : noTrailing.slice(1);
  const segments = inner.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { locale: DEFAULT_LOCALE, slugPathWithoutLocale: "/" };
  }

  const first = segments[0]!;
  if (first.length !== 2) {
    return { locale: DEFAULT_LOCALE, slugPathWithoutLocale: noTrailing };
  }

  const locale = (isPrefixedLocale(first) ? first : first) as SsrLocale;
  const rest = segments.slice(1);
  const slugPathWithoutLocale =
    rest.length === 0 ? "/" : `/${rest.join("/")}`;

  return { locale, slugPathWithoutLocale };
};
