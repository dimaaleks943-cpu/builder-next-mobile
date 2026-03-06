/**
 * Базовый URL API, который использует runtime (site-runtime-ssr).
 * Аналог переменной API_URL в `site-runtime-ssr`.
 */
export const RUNTIME_API_BASE_URL =
  process.env.EXPO_PUBLIC_RUNTIME_API_URL ?? "https://dev-api.cezyo.com";

const cleanPublicEnv = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  if (!v) return undefined;
  const lower = v.toLowerCase();
  if (lower === "undefined" || lower === "null") return undefined;
  return v;
};

/**
 * Домен сайта, для которого собрана мобильная витрина.
 * В Next.js он берётся из Host, здесь — из переменной окружения.
 *
 * Пример: marketflow.store
 */
export const RUNTIME_SITE_DOMAIN =
  cleanPublicEnv(process.env.EXPO_PUBLIC_SITE_DOMAIN) ?? "marketflow.store";

/**
 * Базовый URL веб-сайта (site-runtime-ssr) для отображения страниц в WebView.
 * По умолчанию: https://{RUNTIME_SITE_DOMAIN}
 */
const normalizeWebBaseUrl = (value: string): string => {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const SITE_WEB_BASE_URL = normalizeWebBaseUrl(
  cleanPublicEnv(process.env.EXPO_PUBLIC_SITE_WEB_URL) ??
    `https://${RUNTIME_SITE_DOMAIN}`,
);

export const cleanDomain = (domain: string): string =>
  domain.includes(":") ? domain.split(":")[0] : domain;


