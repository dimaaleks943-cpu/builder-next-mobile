/**
 * API страниц сайта: запрос списка страниц и страницы по slug с бэкенда конструктора.
 * используется для выбора способа отображения (нативный рендер или WebView) и для загрузки контента страницы.
 */
import { API_BASE_URL, SITE_DOMAIN, cleanDomain } from "./config";
import { readQueryString, type PreviewParams } from "../lib/previewQuery";


export enum PAGE_TYPES {
  STATIC = "static",
  TEMPLATE = "template",
  SYSTEM_COMPONENT = "system_component",
  SYSTEM_PAGE = "system_page",
}

export interface SitePage {
  id: string;
  name: string;
  slug: string;
  content: string;
  /** Если true — контент собран для RN, рендерить нативно; иначе — WebView */
  is_mobile_content?: boolean;
  /** Публичный GET /pages с x-mobile-client может не отдавать — тогда считаем страницу статической. */
  type?: PAGE_TYPES;
  code?: string | null;
  version?: string | null;
  collection_type_id?: string | null;
  item_path_prefix?: string | null;
  /**
   * Порядок страницы из API; при равной длине префикса template выбирается меньший sort.
   * Публичный GET может не отдавать.
   */
  sort?: number | null;
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

/** Нормализация пути страницы (как в site-runtime-ssr `[[...slug]]`). */
export function normalizeSiteSlugPath(slugPath: string): string {
  return slugPath.length === 0
    ? "/"
    : slugPath.startsWith("/")
      ? slugPath
      : `/${slugPath}`;
}

export function findOriginalByCode(
  pages: SitePage[],
  type: PAGE_TYPES,
  code: string,
): SitePage | undefined {
  return pages.find(
    (page) =>
      page.type === type && page.code === code && (page.version ?? null) === null,
  );
}

export function findVersionByCode(
  pages: SitePage[],
  type: PAGE_TYPES,
  code: string,
  version: string,
): SitePage | undefined {
  return pages.find(
    (page) => page.type === type && page.code === code && page.version === version,
  );
}

export function findPreviewPageByOriginalCode(
  pages: SitePage[],
  previewParams: PreviewParams,
  originalPage: SitePage,
): SitePage {
  const code = originalPage.code;
  if (!code) return originalPage;

  const requestedVersion = readQueryString(previewParams[code]);
  if (!requestedVersion) return originalPage;

  return (
    findVersionByCode(pages, originalPage.type ?? PAGE_TYPES.STATIC, code, requestedVersion) ??
    originalPage
  );
}

export type SystemLayoutComponents = {
  header: SitePage | null;
  footer: SitePage | null;
};

function resolveSystemLayoutComponentByCode(
  pages: SitePage[],
  previewParams: PreviewParams,
  code: "header" | "footer",
): SitePage | null {
  const original = findOriginalByCode(pages, PAGE_TYPES.SYSTEM_COMPONENT, code);
  if (!original) return null;

  const requestedVersion = readQueryString(previewParams[code]);
  const selected =
    requestedVersion != null
      ? findVersionByCode(
          pages,
          PAGE_TYPES.SYSTEM_COMPONENT,
          code,
          requestedVersion,
        ) ?? original
      : original;

  return selected.is_mobile_content ? selected : null;
}

export function resolveSystemLayoutComponents(
  pages: SitePage[],
  previewParams: PreviewParams,
): SystemLayoutComponents {
  return {
    header: resolveSystemLayoutComponentByCode(pages, previewParams, "header"),
    footer: resolveSystemLayoutComponentByCode(pages, previewParams, "footer"),
  };
}
