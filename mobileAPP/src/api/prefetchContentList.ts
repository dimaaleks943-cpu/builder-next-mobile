import { fetchContentItems } from "./collectionsApi";
import type { IContentItem } from "./contentTypes";
import {
  extractContentListPrefetchPairsFromCraftContent,
} from "../lib/extractContentListSources";
import { getCollectionItemsCacheKey } from "../lib/collectionItemsCacheKey";

export async function prefetchContentListPairs(
  domain: string,
  pageContent: string,
  category?: { id: string; slug?: string | null },
): Promise<{
  collectionItemsByTypeId: Record<string, IContentItem[]>;
  initialSelectedCategoryIdByScope: Record<string, string | null>;
  initialSelectedCategorySlugByScope: Record<string, string | null>;
}> {
  const pairs = extractContentListPrefetchPairsFromCraftContent(pageContent);
  const collectionItemsByTypeId: Record<string, IContentItem[]> = {};
  const initialSelectedCategoryIdByScope: Record<string, string | null> = {};
  const initialSelectedCategorySlugByScope: Record<string, string | null> = {};

  const catSlug = category?.slug?.trim() || null;

  if (category) {
    for (const p of pairs) {
      if (p.filterScope) {
        initialSelectedCategoryIdByScope[p.filterScope] = category.id;
        if (catSlug) {
          initialSelectedCategorySlugByScope[p.filterScope] = catSlug;
        }
      }
    }
  }

  await Promise.all(
    pairs.map(async (pair) => {
      const key = getCollectionItemsCacheKey(
        pair.filterScope,
        pair.selectedSource,
      );
      const useCat = Boolean(category && pair.filterScope);
      const data = await fetchContentItems(domain, pair.selectedSource, {
        categoryIds: useCat && category ? [category.id] : undefined,
      });
      collectionItemsByTypeId[key] = data ?? [];
    }),
  );

  return {
    collectionItemsByTypeId,
    initialSelectedCategoryIdByScope,
    initialSelectedCategorySlugByScope,
  };
}
