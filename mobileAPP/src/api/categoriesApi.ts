import { API_BASE_URL, cleanDomain } from "./config";
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
    searchParams.set("filter", JSON.stringify({ category_id: [rootId] }));
    if (params?.limit != null) searchParams.set("limit", String(params.limit));
    if (params?.offset != null)
      searchParams.set("offset", String(params.offset));
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
