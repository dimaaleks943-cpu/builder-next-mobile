/**
 * API страниц сайта: запрос списка страниц и страницы по slug с бэкенда конструктора.
 * используется для выбора способа отображения (нативный рендер или WebView) и для загрузки контента страницы.
 */

import { API_BASE_URL, SITE_DOMAIN, cleanDomain } from "./config";

export interface SitePage {
  id: string;
  name: string;
  slug: string;
  content: string;
  /** Если true — контент собран для RN, рендерить нативно; иначе — WebView */
  is_mobile_content?: boolean;
}

export interface SitePagesResponse {
  data: SitePage[];
  links: unknown | null;
}

/** возвращает список страниц сайта для указанного домена. */
export const fetchSitePages = async (
  domain: string = SITE_DOMAIN,
): Promise<SitePage[] | null> => {
  const domainClean = cleanDomain(domain);

  try {
    const response = await fetch(
      `${API_BASE_URL}/v3/sites/${domainClean}/pages`,
      { headers: { "x-mobile-client": "true" } },
    );

    if (!response.ok) return null

    const json = (await response.json()) as SitePagesResponse;
    return json.data;
  } catch (error) {
    return null;
  }
};

/** получаем одну страницу по slug ("/", "/about" и т.п.) для текущего домена. */
export const fetchSitePageBySlug = async (
  slugPath: string,
  domain: string = SITE_DOMAIN,
): Promise<SitePage | null> => {
  const pages = await fetchSitePages(domain);
  if (!pages) return null;

  const normalized =
    slugPath.length === 0 ? "/" : slugPath.startsWith("/") ? slugPath : `/${slugPath}`;

  const page =
    pages.find((p) => p.slug === normalized) ||
    (normalized === "/" ? pages.find((p) => p.slug === "/") : undefined);

  return page ?? null;
};
