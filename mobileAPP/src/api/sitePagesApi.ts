/**
 * API страниц сайта: запрос списка страниц и страницы по slug с бэкенда конструктора.
 * используется для выбора способа отображения (нативный рендер или WebView) и для загрузки контента страницы.
 */

import {
  fetchContentItemById,
  fetchContentItems,
} from "./collectionsApi";
import type { IContentItem } from "./contentTypes";
import { API_BASE_URL, SITE_DOMAIN, cleanDomain } from "./config";
import {
  findContentItemByUrlSegment,
  isTemplateSitePage,
  isUuidLikePathSegment,
  resolveTemplatePageForSlug,
} from "../lib/templateRoute";

export interface SitePage {
  id: string;
  name: string;
  slug: string;
  content: string;
  /** Если true — контент собран для RN, рендерить нативно; иначе — WebView */
  is_mobile_content?: boolean;
  /** Публичный GET /pages с x-mobile-client может не отдавать — тогда считаем страницу статической. */
  type?: "static" | "template";
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

export type ResolvedSitePageRoute =
  | { kind: "static"; page: SitePage }
  | { kind: "template"; page: SitePage; itemSegment: string };

/**
 * Статическая страница по точному slug (не template) или template с сегментом записи.
 * Повторяет логику выбора страницы в site-runtime-ssr/pages/[[...slug]].tsx.
 */
export function resolveSitePageForSlugPath(
  pages: SitePage[],
  slugPath: string,
): ResolvedSitePageRoute | null {
  const normalized = normalizeSiteSlugPath(slugPath);
  const isStaticPage = (p: SitePage) => !isTemplateSitePage(p);

  let page: SitePage | undefined =
    pages.find((p) => p.slug === normalized && isStaticPage(p)) ||
    (normalized === "/"
      ? pages.find((p) => p.slug === "/" && isStaticPage(p))
      : undefined);

  if (page) {
    return { kind: "static", page };
  }

  const resolved = resolveTemplatePageForSlug(pages, normalized);
  if (!resolved) return null;

  return {
    kind: "template",
    page: resolved.page,
    itemSegment: resolved.itemSegment,
  };
}

export type TemplateItemResolveResult = {
  item: IContentItem;
  /** Значение для `collectionItemsByTypeId[collection_type_id]` (как на SSR). */
  itemsForTemplateType: IContentItem[];
};

/**
 * Загрузка записи для template-страницы по сегменту URL (UUID или slug-поле).
 */
export async function fetchTemplatePageItem(
  domain: string,
  page: SitePage,
  itemSegment: string,
): Promise<TemplateItemResolveResult | null> {
  const typeId = page.collection_type_id?.trim();
  if (!typeId) return null;

  if (isUuidLikePathSegment(itemSegment)) {
    const byId = await fetchContentItemById(domain, itemSegment);
    if (!byId) return null;
    const raw = byId as Record<string, unknown>;
    const itemTypeId =
      (typeof byId.content_type_id === "string"
        ? byId.content_type_id
        : undefined) ??
      (typeof raw.collection_type_id === "string"
        ? raw.collection_type_id
        : undefined);
    if (
      !itemTypeId ||
      itemTypeId.trim().toLowerCase() !== typeId.toLowerCase()
    ) {
      return null;
    }
    return { item: byId, itemsForTemplateType: [byId] };
  }

  const items = (await fetchContentItems(domain, typeId)) ?? [];
  const item = findContentItemByUrlSegment(items, itemSegment);
  if (!item) return null;
  return { item, itemsForTemplateType: items };
}

/** получаем одну страницу по slug ("/", "/about" и т.п.) для текущего домена. */
export const fetchSitePageBySlug = async (
  slugPath: string,
  domain: string = SITE_DOMAIN,
): Promise<SitePage | null> => {
  const pages = await fetchSitePages(domain);
  if (!pages) return null;
  const resolved = resolveSitePageForSlugPath(pages, slugPath);
  return resolved?.page ?? null;
};
