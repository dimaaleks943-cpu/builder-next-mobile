/**
 * Паритет с site-runtime-ssr/pages/[[...slug]].tsx: статика, template-деталка по slug, витрина с категорией.
 */

import type { IContentItem } from "./contentTypes";
import { fetchContentCategoryBySlug } from "./categoriesApi";
import { fetchContentItemBySlug, fetchContentItems } from "./collectionsApi";
import { prefetchContentListPairs } from "./prefetchContentList";
import { normalizeSiteSlugPath, type SitePage } from "./sitePagesApi";
import {
  categoryTrailBetweenPrefixAndItemSlug,
  splitBaseSlugAndTail,
} from "../lib/catalogPathResolve";
import { getCollectionItemsCacheKey } from "../lib/collectionItemsCacheKey";
import { extractContentListPrefetchPairsFromCraftContent } from "../lib/extractContentListSources";
import {
  getItemContentTypeId,
  isTemplateSitePage,
  normalizeItemPathPrefix,
  resolveTemplatePageForSlug,
} from "../lib/templateRoute";

const EMPTY_CATEGORY_SCOPE: Record<string, string | null> = {};

function findStaticPage(
  pages: SitePage[],
  slugPath: string,
): SitePage | undefined {
  const isStatic = (p: SitePage) => !isTemplateSitePage(p);
  return (
    pages.find((p) => p.slug === slugPath && isStatic(p)) ||
    (slugPath === "/"
      ? pages.find((p) => p.slug === "/" && isStatic(p))
      : undefined)
  );
}

export type StorefrontRouteResolved = {
  slugPath: string;
  page: SitePage;
  sitePages: SitePage[];
  collectionItemsByKey: Record<string, IContentItem[]>;
  templateContentData: {
    collectionKey: string;
    itemData: IContentItem;
  } | null;
  initialSelectedCategoryIdByScope: Record<string, string | null>;
  initialSelectedCategorySlugByScope: Record<string, string | null>;
  pageBaseSlug: string;
  categorySlugTrailFromUrl: string | null;
};

export async function resolveStorefrontRoute(
  domain: string,
  pages: SitePage[],
  slugPathInput: string,
): Promise<StorefrontRouteResolved | null> {
  const slugPath = normalizeSiteSlugPath(
    slugPathInput.length === 0 ? "/" : slugPathInput,
  );

  const { baseSlug, tailSlug } = splitBaseSlugAndTail(slugPath);

  if (tailSlug === null) {
    const page = findStaticPage(pages, slugPath);
    if (!page?.content) return null;

    const pageBaseSlug = normalizeItemPathPrefix(page.slug);

    const {
      collectionItemsByTypeId,
      initialSelectedCategoryIdByScope,
      initialSelectedCategorySlugByScope,
    } = await prefetchContentListPairs(domain, page.content);

    return {
      slugPath,
      page,
      sitePages: pages,
      collectionItemsByKey: collectionItemsByTypeId,
      templateContentData: null,
      initialSelectedCategoryIdByScope,
      initialSelectedCategorySlugByScope,
      pageBaseSlug,
      categorySlugTrailFromUrl: null,
    };
  }

  const item = await fetchContentItemBySlug(domain, tailSlug);

  if (item) {
    const resolved = resolveTemplatePageForSlug(pages, slugPath);
    if (!resolved) return null;

    const page = resolved.page;
    const typeId = page.collection_type_id?.trim();
    if (!typeId || !isTemplateSitePage(page)) return null;

    const itemTypeId = getItemContentTypeId(item)?.trim();
    if (
      !itemTypeId ||
      itemTypeId.toLowerCase() !== typeId.toLowerCase()
    ) {
      return null;
    }

    if (!page.content) return null;

    const templateContentData = {
      collectionKey: typeId,
      itemData: item,
    };

    const pairs = extractContentListPrefetchPairsFromCraftContent(page.content);
    const collectionItemsByTypeId: Record<string, IContentItem[]> = {};
    const typeIdLower = typeId.toLowerCase();

    for (const pair of pairs) {
      if (pair.selectedSource.trim().toLowerCase() === typeIdLower) {
        const key = getCollectionItemsCacheKey(
          pair.filterScope,
          pair.selectedSource,
        );
        collectionItemsByTypeId[key] = [item];
      }
    }
    if (Object.keys(collectionItemsByTypeId).length === 0) {
      collectionItemsByTypeId[typeId] = [item];
    }

    const extraPairs = pairs.filter((p) => {
      const key = getCollectionItemsCacheKey(p.filterScope, p.selectedSource);
      return collectionItemsByTypeId[key] === undefined;
    });

    await Promise.all(
      extraPairs.map(async (pair) => {
        const key = getCollectionItemsCacheKey(
          pair.filterScope,
          pair.selectedSource,
        );
        const data = await fetchContentItems(domain, pair.selectedSource);
        collectionItemsByTypeId[key] = data ?? [];
      }),
    );

    const pageBaseSlug = normalizeItemPathPrefix(
      page.item_path_prefix ?? page.slug,
    );
    const categorySlugTrailFromUrl = categoryTrailBetweenPrefixAndItemSlug(
      pageBaseSlug,
      slugPath,
      tailSlug,
    );

    return {
      slugPath,
      page,
      sitePages: pages,
      collectionItemsByKey: collectionItemsByTypeId,
      templateContentData,
      initialSelectedCategoryIdByScope: EMPTY_CATEGORY_SCOPE,
      initialSelectedCategorySlugByScope: EMPTY_CATEGORY_SCOPE,
      pageBaseSlug,
      categorySlugTrailFromUrl,
    };
  }

  const category = await fetchContentCategoryBySlug(domain, tailSlug);
  if (!category) return null;

  const page = findStaticPage(pages, baseSlug);
  if (!page?.content) return null;

  const categorySlugForState =
    category.slug?.trim() || tailSlug.trim() || null;

  const {
    collectionItemsByTypeId,
    initialSelectedCategoryIdByScope,
    initialSelectedCategorySlugByScope,
  } = await prefetchContentListPairs(domain, page.content, {
    id: category.id,
    slug: categorySlugForState,
  });

  const pageBaseSlug = normalizeItemPathPrefix(page.slug);

  return {
    slugPath,
    page,
    sitePages: pages,
    collectionItemsByKey: collectionItemsByTypeId,
    templateContentData: null,
    initialSelectedCategoryIdByScope,
    initialSelectedCategorySlugByScope,
    pageBaseSlug,
    categorySlugTrailFromUrl: categorySlugForState,
  };
}
