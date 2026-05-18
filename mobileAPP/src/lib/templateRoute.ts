import type { IContentItem } from "../api/contentTypes";
import { PAGE_TYPES, type SitePage } from "../api/sitePagesApi";
import { getContentFieldDisplayValue } from "../content/contentFieldValue";

/** Согласовано с builder `normalizeItemPathPrefix`: префикс URL записей коллекции на template-странице. */
export function normalizeItemPathPrefix(
  slug: string | null | undefined,
): string {
  const t = (slug ?? "").trim();
  if (!t) return "/";
  const withSlash = t.startsWith("/") ? t : `/${t}`;
  const trimmed = withSlash.replace(/\/+$/, "") || "/";
  return trimmed;
}

export function extractTemplateItemPathSegment(
  slugPath: string,
  page: SitePage,
): string | null {
  const prefix = normalizeItemPathPrefix(
    page.item_path_prefix ?? page.slug,
  );
  if (prefix === "/") {
    if (slugPath === "/" || slugPath === "") return null;
    const s = slugPath.startsWith("/") ? slugPath.slice(1) : slugPath;
    if (!s.length) return null;
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  }
  const pathPrefix = `${prefix}/`;
  if (!slugPath.startsWith(pathPrefix)) return null;
  const rest = slugPath.slice(pathPrefix.length);
  if (!rest.length) return null;
  try {
    return decodeURIComponent(rest);
  } catch {
    return rest;
  }
}

function fieldLooksLikeSlug(f: {
  name?: string;
  field_type?: string;
}): boolean {
  const name = typeof f.name === "string" ? f.name.toLowerCase() : "";
  if (name === "slug" || name.endsWith("_slug")) return true;
  const ft = typeof f.field_type === "string" ? f.field_type.toLowerCase() : "";
  return ft.includes("slug");
}

const SORT_FALLBACK = Number.POSITIVE_INFINITY;

function pageSortKey(page: SitePage): number {
  const s = page.sort;
  return typeof s === "number" && Number.isFinite(s) ? s : SORT_FALLBACK;
}

export function isTemplateSitePage(page: SitePage): boolean {
  return page.type === PAGE_TYPES.TEMPLATE;
}

/**
 * Выбирает template-страницу с наиболее длинным подходящим префиксом (при пересечениях).
 */
export function getItemContentTypeId(item: IContentItem): string | undefined {
  const raw = item as Record<string, unknown>;
  const a =
    typeof item.content_type_id === "string"
      ? item.content_type_id
      : undefined;
  const b =
    typeof raw.collection_type_id === "string"
      ? raw.collection_type_id
      : undefined;
  return a ?? b;
}

export function resolveTemplatePageForSlug(
  pages: SitePage[],
  slugPath: string,
): { page: SitePage; itemSegment: string } | null {
  const candidates = pages.filter(
    (p) =>
      isTemplateSitePage(p) &&
      (p.version ?? null) === null &&
      Boolean(p.collection_type_id?.trim()),
  );

  const scored = candidates
    .map((page) => {
      const segment = extractTemplateItemPathSegment(slugPath, page);
      if (!segment) return null;
      const prefixLen = normalizeItemPathPrefix(
        page.item_path_prefix ?? page.slug,
      ).length;
      return { page, itemSegment: segment, prefixLen };
    })
    .filter((x): x is NonNullable<typeof x> => x != null)
    .sort((a, b) => {
      if (b.prefixLen !== a.prefixLen) return b.prefixLen - a.prefixLen;
      const sortDiff = pageSortKey(a.page) - pageSortKey(b.page);
      if (sortDiff !== 0) return sortDiff;
      return a.page.id.localeCompare(b.page.id);
    });

  const best = scored[0];
  return best ? { page: best.page, itemSegment: best.itemSegment } : null;
}
