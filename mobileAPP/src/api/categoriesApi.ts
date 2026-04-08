import { API_BASE_URL, cleanDomain } from "./config";
import { parseSingleEntityJson } from "./apiParsers";
import type { ContentCategory, PaginatedResponse } from "./contentTypes";

/**
 * GET /v3/sites/{domain}/content/categories — список категорий для UI фильтра.
 * `categoryRootId` попадает в filter как корень дерева, дочерние узлы показываются в CategoryFilter.
 */
export const fetchContentCategories = async (
  domain: string,
  params?: {
    limit?: number;
    offset?: number;
    /** UUID корня дерева — в filter уходит `category_id: [id]`. */
    categoryRootId?: string;
  },
): Promise<ContentCategory[] | null> => {
  const domainClean = cleanDomain(domain);
  if (!domainClean) return null;

  const rootId = params?.categoryRootId?.trim();
  if (!rootId) return null;

  try {
    const searchParams = new URLSearchParams();
    searchParams.set("filter", JSON.stringify({ content_type_id: [rootId] }));
    const qs = searchParams.toString();

    const response = await fetch(
      `${API_BASE_URL}/v3/sites/${encodeURIComponent(domainClean)}/content/categories${qs ? `?${qs}` : ""}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) return null;

    const json = (await response.json()) as PaginatedResponse<ContentCategory>;
    return json.data || [];
  } catch {
    return null;
  }
};

/**
 * GET /v3/sites/{domain}/content/categories/s/{slug}
 */
export const fetchContentCategoryBySlug = async (
  domain: string,
  slug: string,
): Promise<ContentCategory | null> => {
  const domainClean = cleanDomain(domain);
  const s = slug.trim();
  if (!domainClean || !s) return null;

  try {
    const response = await fetch(
      `${API_BASE_URL}/v3/sites/${encodeURIComponent(domainClean)}/content/categories/s/${encodeURIComponent(s)}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) return null;

    const json: unknown = await response.json();
    return parseSingleEntityJson<ContentCategory>(json);
  } catch {
    return null;
  }
};
