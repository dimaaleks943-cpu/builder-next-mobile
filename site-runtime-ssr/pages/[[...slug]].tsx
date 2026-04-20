import type { GetServerSideProps, GetServerSidePropsResult } from "next"
import Head from "next/head"
import { renderPage } from "@/lib/renderer"
import type { ComponentNode } from "@/lib/interface"
import { getSitePages, normalizeSiteDomain, type SitePage } from "@/lib/sitePages"
import { craftContentToComponents } from "@/lib/craftContentToComponents"
import { fetchContentItemBySlug, fetchContentItems } from "@/lib/collectionsApi"
import { fetchContentCategoryBySlug } from "@/lib/categoriesApi"
import {
  extractContentListPrefetchPairsFromCraftContent,
} from "@/lib/extractContentListSources"
import { getCollectionItemsCacheKey } from "@/lib/collectionItemsCacheKey"
import {
  categoryTrailBetweenPrefixAndItemSlug,
  splitBaseSlugAndTail,
} from "@/lib/catalogPathResolve"
import type { IContentItem } from "@/lib/contentTypes"
import {
  parseLocaleFromSlugPath,
  prefixPublicPath,
  type SsrLocale,
} from "@/lib/localeFromPath"
import {
  getHardcodedTranslationsForPage,
  type PageTranslatePayload,
} from "@/lib/hardcodedPageTranslations"
import { SiteCollectionsProvider } from "@/components/SiteCollectionsContext"
import { ContentDataProvider } from "@/components/ContentDataContext"
import { CollectionFilterScopeProvider } from "@/components/CollectionFilterScopeContext"
import { StorefrontPageProvider } from "@/components/StorefrontPageContext"
import { PageLocaleProvider } from "@/components/PageLocaleContext"
import {
  getItemContentTypeId,
  isTemplateSitePage,
  normalizeItemPathPrefix,
  resolveTemplatePageForSlug,
} from "@/lib/templateRoute"
import { buildResponsiveCss } from "@/lib/responsiveCss"

const EMPTY_CATEGORY_SCOPE: Record<string, string | null> = {}

interface PageProps {
  domain: string
  /** Публичный путь без языкового префикса (как `SitePage.slug`). */
  slug: string
  locale: SsrLocale
  pageTranslate: PageTranslatePayload
  components: ComponentNode[]
  collectionItemsByTypeId: Record<string, IContentItem[]>
  sitePages: SitePage[]
  /** Данные записи для template-страницы (поля Text/Image вне ContentList). */
  templateContentData: {
    collectionKey: string
    itemData: IContentItem
  } | null
  /** Начальный выбор категории по filterScope (SSR, URL вида /страница/slug-категории). */
  initialSelectedCategoryIdByScope: Record<string, string | null>
  initialSelectedCategorySlugByScope: Record<string, string | null>
  /** Slug статической витрины (`/gid`) или префикс template — для push и ссылок. */
  pageBaseSlug: string
  /** Хвост категории из URL между витриной и итемом (`europe` для `/gid/europe/luvr`). */
  categorySlugTrailFromUrl: string | null
}

function findStaticPage(
  pages: SitePage[],
  slugPath: string,
): SitePage | undefined {
  const isStatic = (p: SitePage) => !isTemplateSitePage(p)
  return (
    pages.find((p) => p.slug === slugPath && isStatic(p)) ||
    (slugPath === "/"
      ? pages.find((p) => p.slug === "/" && isStatic(p))
      : undefined)
  )
}

async function prefetchContentListPairs(
  domain: string,
  pageContent: string,
  category?: { id: string; slug?: string | null },
): Promise<{
  collectionItemsByTypeId: Record<string, IContentItem[]>
  initialSelectedCategoryIdByScope: Record<string, string | null>
  initialSelectedCategorySlugByScope: Record<string, string | null>
}> {
  const pairs = extractContentListPrefetchPairsFromCraftContent(pageContent)
  const collectionItemsByTypeId: Record<string, IContentItem[]> = {}
  const initialSelectedCategoryIdByScope: Record<string, string | null> = {}
  const initialSelectedCategorySlugByScope: Record<string, string | null> = {}

  const catSlug = category?.slug?.trim() || null

  if (category) {
    for (const p of pairs) {
      if (p.filterScope) {
        initialSelectedCategoryIdByScope[p.filterScope] = category.id
        if (catSlug) {
          initialSelectedCategorySlugByScope[p.filterScope] = catSlug
        }
      }
    }
  }

  await Promise.all(
    pairs.map(async (pair) => {
      const key = getCollectionItemsCacheKey(
        pair.filterScope,
        pair.selectedSource,
      )
      const useCat = Boolean(category && pair.filterScope)
      const data = await fetchContentItems(domain, pair.selectedSource, {
        categoryIds: useCat && category ? [category.id] : undefined,
      })
      collectionItemsByTypeId[key] = data ?? []
    }),
  )

  return {
    collectionItemsByTypeId,
    initialSelectedCategoryIdByScope,
    initialSelectedCategorySlugByScope,
  }
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
): Promise<GetServerSidePropsResult<PageProps>> => {
  const hostHeader = "marketflow.store" // context.req.headers.host ?? "" //
  const domain = normalizeSiteDomain(hostHeader)

  if (!domain) {
    return { notFound: true }
  }

  const rawSlug =
    (context.params?.slug as string[] | undefined)?.join("/") ?? ""
  const slugPath =
    rawSlug.length === 0 ? "/" : rawSlug.startsWith("/") ? rawSlug : `/${rawSlug}`

  const { locale, slugPathWithoutLocale } = parseLocaleFromSlugPath(slugPath)

  const pages = await getSitePages(domain)

  if (!pages) {
    return { notFound: true }
  }

  const { baseSlug, tailSlug } = splitBaseSlugAndTail(slugPathWithoutLocale)

  if (tailSlug === null) {
    const page = findStaticPage(pages, slugPathWithoutLocale)
    if (!page?.content) {
      return { notFound: true }
    }

    const components = craftContentToComponents(page.content)
    if (components.length === 0) {
      return { notFound: true }
    }

    const pageBaseSlug = normalizeItemPathPrefix(page.slug)
    //TODO временно получаем переводы из хардкода, в дальнейшем переводы прихоядт вместе со страницей
    const pageTranslate = getHardcodedTranslationsForPage(page.id)

    const {
      collectionItemsByTypeId,
      initialSelectedCategoryIdByScope,
      initialSelectedCategorySlugByScope,
    } = await prefetchContentListPairs(domain, page.content)

    return {
      props: {
        domain,
        slug: slugPathWithoutLocale,
        locale,
        pageTranslate,
        components,
        collectionItemsByTypeId,
        sitePages: pages,
        templateContentData: null,
        initialSelectedCategoryIdByScope,
        initialSelectedCategorySlugByScope,
        pageBaseSlug,
        categorySlugTrailFromUrl: null,
      },
    }
  }

  const item = await fetchContentItemBySlug(domain, tailSlug)

  if (item) {
    const resolved = resolveTemplatePageForSlug(pages, slugPathWithoutLocale)
    if (!resolved) {
      return { notFound: true }
    }

    const page = resolved.page
    const typeId = page.collection_type_id?.trim()
    if (!typeId || !isTemplateSitePage(page)) {
      return { notFound: true }
    }

    const itemTypeId = getItemContentTypeId(item)?.trim()
    if (
      !itemTypeId ||
      itemTypeId.toLowerCase() !== typeId.toLowerCase()
    ) {
      return { notFound: true }
    }

    if (!page.content) {
      return { notFound: true }
    }

    const components = craftContentToComponents(page.content)
    if (components.length === 0) {
      return { notFound: true }
    }

    const templateContentData = {
      collectionKey: typeId,
      itemData: item,
    }

    const pairs = extractContentListPrefetchPairsFromCraftContent(page.content)
    const collectionItemsByTypeId: Record<string, IContentItem[]> = {}
    const typeIdLower = typeId.toLowerCase()

    for (const pair of pairs) {
      if (pair.selectedSource.trim().toLowerCase() === typeIdLower) {
        const key = getCollectionItemsCacheKey(
          pair.filterScope,
          pair.selectedSource,
        )
        collectionItemsByTypeId[key] = [item]
      }
    }
    if (Object.keys(collectionItemsByTypeId).length === 0) {
      collectionItemsByTypeId[typeId] = [item]
    }

    const extraPairs = pairs.filter((p) => {
      const key = getCollectionItemsCacheKey(p.filterScope, p.selectedSource)
      return collectionItemsByTypeId[key] === undefined
    })

    await Promise.all(
      extraPairs.map(async (pair) => {
        const key = getCollectionItemsCacheKey(
          pair.filterScope,
          pair.selectedSource,
        )
        const data = await fetchContentItems(domain, pair.selectedSource)
        collectionItemsByTypeId[key] = data ?? []
      }),
    )

    const pageBaseSlug = normalizeItemPathPrefix(
      page.item_path_prefix ?? page.slug,
    )
    const categorySlugTrailFromUrl = categoryTrailBetweenPrefixAndItemSlug(
      pageBaseSlug,
      slugPathWithoutLocale,
      tailSlug,
    )
    //TODO временно получаем переводы из хардкода, в дальнейшем переводы прихоядт вместе со страницей
    const pageTranslate = getHardcodedTranslationsForPage(page.id)

    return {
      props: {
        domain,
        slug: slugPathWithoutLocale,
        locale,
        pageTranslate,
        components,
        collectionItemsByTypeId,
        sitePages: pages,
        templateContentData,
        initialSelectedCategoryIdByScope: EMPTY_CATEGORY_SCOPE,
        initialSelectedCategorySlugByScope: EMPTY_CATEGORY_SCOPE,
        pageBaseSlug,
        categorySlugTrailFromUrl,
      },
    }
  }

  const category = await fetchContentCategoryBySlug(domain, tailSlug)
  if (!category) {
    return { notFound: true }
  }

  const page = findStaticPage(pages, baseSlug)
  if (!page?.content) {
    return { notFound: true }
  }

  const components = craftContentToComponents(page.content)
  if (components.length === 0) {
    return { notFound: true }
  }

  const categorySlugForState =
    category.slug?.trim() || tailSlug.trim() || null

  const {
    collectionItemsByTypeId,
    initialSelectedCategoryIdByScope,
    initialSelectedCategorySlugByScope,
  } = await prefetchContentListPairs(domain, page.content, {
    id: category.id,
    slug: categorySlugForState,
  })

  const pageBaseSlug = normalizeItemPathPrefix(page.slug)
  const pageTranslate = getHardcodedTranslationsForPage(page.id)

  return {
    props: {
      domain,
      slug: slugPathWithoutLocale,
      locale,
      pageTranslate,
      components,
      collectionItemsByTypeId,
      sitePages: pages,
      templateContentData: null,
      initialSelectedCategoryIdByScope,
      initialSelectedCategorySlugByScope,
      pageBaseSlug,
      categorySlugTrailFromUrl: categorySlugForState,
    },
  }
}

export default function Page({
  domain,
  slug,
  locale,
  pageTranslate,
  components,
  collectionItemsByTypeId,
  sitePages,
  templateContentData,
  initialSelectedCategoryIdByScope,
  initialSelectedCategorySlugByScope,
  pageBaseSlug,
  categorySlugTrailFromUrl,
}: PageProps) {
  const publicPath = prefixPublicPath(slug, locale)
  const ogUrlSuffix = publicPath === "/" ? "" : publicPath

  const main = (
    <main style={{ minHeight: "100vh" }}>
      {renderPage(components)}
    </main>
  )
  const responsiveCss = buildResponsiveCss(components)

  const inner =
    templateContentData ? (
      <ContentDataProvider
        collectionKey={templateContentData.collectionKey}
        itemData={templateContentData.itemData}
      >
        {main}
      </ContentDataProvider>
    ) : (
      main
    )

  return (
    <>
      <Head>
        <title>{`Страница ${slug} — ${domain}`}</title>
        <meta property="og:title" content={`Страница ${slug} — ${domain}`} />
        <meta property="og:url" content={`https://${domain}${ogUrlSuffix}`} />
        {responsiveCss ? (
          <style
            id="craft-responsive-css"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: responsiveCss }}
          />
        ) : null}
      </Head>
      <SiteCollectionsProvider
        domain={domain}
        collectionItemsByKey={collectionItemsByTypeId}
        sitePages={sitePages}
      >
        <CollectionFilterScopeProvider
          initialSelectedCategoryIdByScope={initialSelectedCategoryIdByScope}
          initialSelectedCategorySlugByScope={initialSelectedCategorySlugByScope}
        >
          <StorefrontPageProvider
            locale={locale}
            pageBaseSlug={pageBaseSlug}
            categorySlugTrailFromUrl={categorySlugTrailFromUrl}
          >
            <PageLocaleProvider
              locale={locale}
              translate={pageTranslate.translate}
            >
              {inner}
            </PageLocaleProvider>
          </StorefrontPageProvider>
        </CollectionFilterScopeProvider>
      </SiteCollectionsProvider>
    </>
  )
}
