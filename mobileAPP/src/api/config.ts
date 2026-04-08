/**
 * Конфигурация приложения: подключение к бэкенду конструктора и к веб-версии сайта.
 * значения задаются через переменные окружения Expo (EXPO_PUBLIC_*).
 */

/** базовый URL API бэкенда конструктора (список страниц, контент, коллекции). */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_RUNTIME_API_URL ?? "https://dev-api.cezyo.com";

const cleanPublicEnv = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  if (!v) return undefined;
  const lower = v.toLowerCase();
  if (lower === "undefined" || lower === "null") return undefined;
  return v;
};

/** домен сайта, для которого развёрнуто приложение (например marketflow.store). */
export const SITE_DOMAIN =
  cleanPublicEnv(process.env.EXPO_PUBLIC_SITE_DOMAIN) ?? "marketflow.store"; // tODO заглушка для разработки marketflow.stor

/** URL веб-версии сайта для отображения страниц в WebView. По умолчанию: https://{SITE_DOMAIN}. */
const normalizeWebBaseUrl = (value: string): string => {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const WEB_VIEW_BASE_URL = "https://sites-test.cezyo.com/"

  // normalizeWebBaseUrl(
  // cleanPublicEnv(process.env.EXPO_PUBLIC_SITE_WEB_URL) ??
  //   `https://${SITE_DOMAIN}`,
// );

export const cleanDomain = (domain: string): string =>
  domain.includes(":") ? domain.split(":")[0] : domain;
