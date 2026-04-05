import { API_BASE_URL, cleanDomain } from "./config";
import type {
  ContentType,
  IContentItem,
  PaginatedResponse,
} from "./contentTypes";

export type CollectionInfo = {
  key: string;
  label: string;
  items: IContentItem[];
};

/** Собирает `filter` для GET content/items: тип контента обязателен; категории — при активном фильтре на странице. */
function buildContentItemsFilter(
  contentTypeId: string,
  categoryIds?: string[],
): string {
  const payload: Record<string, string[]> = {
    content_type_id: [contentTypeId.trim()],
  };
  const ids = categoryIds?.map((id) => id.trim()).filter(Boolean);
  if (ids?.length) payload.category_id = ids;
  return JSON.stringify(payload);
}

/**
 * GET /v3/sites/{domain}/content/items с filter по content_type_id, опционально category_id.
 */
export const fetchContentItems = async (
  domain: string,
  contentTypeId: string,
  params?: {
    limit?: number;
    offset?: number;
    categoryIds?: string[];
  },
): Promise<IContentItem[] | null> => {
  const domainClean = cleanDomain(domain);
  const contentTypeIdClean = contentTypeId.trim();
  if (!domainClean || !contentTypeIdClean) return null;

  try {
    const filter = buildContentItemsFilter(contentTypeIdClean, params?.categoryIds);
    const searchParams = new URLSearchParams({ filter });
    if (params?.limit != null) searchParams.set("limit", String(params.limit));
    if (params?.offset != null)
      searchParams.set("offset", String(params.offset));

    const response = await fetch(
      `${API_BASE_URL}/v3/sites/${encodeURIComponent(domainClean)}/content/items?${searchParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) return null;

    const json = (await response.json()) as PaginatedResponse<IContentItem>;
    return json.data || [];
  } catch (error) {
    return null;
  }
};

function parseSingleContentItemJson(json: unknown): IContentItem | null {
  if (!json || typeof json !== "object") return null;
  const o = json as Record<string, unknown>;
  if (o.data != null && typeof o.data === "object" && !Array.isArray(o.data)) {
    const inner = o.data as Record<string, unknown>;
    if (typeof inner.id === "string") return o.data as IContentItem;
  }
  if (typeof o.id === "string") return json as IContentItem;
  return null;
}

/**
 * GET /v3/sites/{domain}/content/items/{content_item_id}
 */
export const fetchContentItemById = async (
  domain: string,
  contentItemId: string,
): Promise<IContentItem | null> => {
  const domainClean = cleanDomain(domain);
  const id = contentItemId.trim();
  if (!domainClean || !id) return null;

  try {
    const response = await fetch(
      `${API_BASE_URL}/v3/sites/${encodeURIComponent(domainClean)}/content/items/${encodeURIComponent(id)}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) return null;

    const json: unknown = await response.json();
    return parseSingleContentItemJson(json);
  } catch (error) {
    return null;
  }
};

export const getCollectionByKey = async (
  domain: string,
  key: string,
): Promise<CollectionInfo | null> => {
  const items = await fetchContentItems(domain, key);
  if (items === null) return null;
  return {
    key,
    label: key,
    items,
  };
};

