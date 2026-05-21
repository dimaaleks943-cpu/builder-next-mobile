import type { GetServerSideProps, GetServerSidePropsResult } from "next"
import Head from "next/head"
import type { ParsedUrlQuery } from "querystring"
import { renderPage } from "@/lib/renderer"
import type { ComponentNode } from "@/lib/interface"
import {
  findOriginalByCode,
  findVersionByCode,
  getSitePages,
  normalizeSiteDomain,
  PAGE_TYPES,
  type SitePage,
} from "@/lib/sitePages"
import { craftContentToComponents } from "@/lib/craftContentToComponents"
import { buildCraftPageCss } from "@/lib/styleClasses/buildCraftPageCss"
import { CRAFT_FRAGMENT_SCOPE } from "@/lib/styleClasses/fragmentScope"
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
  isStaticSitePage,
  isSystemPageSitePage,
  isTemplateSitePage,
  normalizeItemPathPrefix,
  resolveTemplatePageForSlug,
} from "@/lib/templateRoute"
import { getUploadedFontsFaceCss } from "@/lib/fonts/uploadedFontsRegistry"

const UPLOADED_FONTS_FACE_CSS = getUploadedFontsFaceCss()

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
  headerComponents: ComponentNode[]
  footerComponents: ComponentNode[]
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
  craftCss: string
}

function isContentSitePage(page: SitePage): boolean {
  return isStaticSitePage(page) || isSystemPageSitePage(page)
}

function findContentPage(
  pages: SitePage[],
  slugPath: string,
): SitePage | undefined {
  return (
    pages.find(
      (p) =>
        p.slug === slugPath && isContentSitePage(p) && p.version === null,
    ) ||
    (slugPath === "/"
      ? pages.find(
          (p) => p.slug === "/" && isContentSitePage(p) && p.version === null,
        )
      : undefined)
  )
}

function findPreviewPageByOriginalCode(
  pages: SitePage[],
  query: ParsedUrlQuery,
  originalPage: SitePage,
): SitePage {
  const code = originalPage.code
  if (!code) {
    return originalPage
  }

  const requestedVersion = readQueryString(query[code])
  if (!requestedVersion) {
    return originalPage
  }

  return (
    findVersionByCode(
      pages,
      originalPage.type,
      code,
      requestedVersion,
    ) ?? originalPage
  )
}
/**
 * собирает header/footer для сайта:
 *
 * Ищет страницы типа SYSTEM_COMPONENT с code `header` / `footer`.
 * Версию можно переопределить query-параметром (`?header=…`, `?footer=…`) —
 * версия по query.header/query.footer, иначе оригинал
 */
function resolveSystemLayoutComponents(pages: SitePage[], query: ParsedUrlQuery): {
  headerComponents: ComponentNode[]
  footerComponents: ComponentNode[]
  headerCraft: ReturnType<typeof craftContentToComponents>
  footerCraft: ReturnType<typeof craftContentToComponents>
} {
  const pickByCode = (code: "header" | "footer"): SitePage | undefined => {
    const requestedVersion = readQueryString(query[code])
    return (
      (requestedVersion
        ? findVersionByCode(
            pages,
            PAGE_TYPES.SYSTEM_COMPONENT,
            code,
            requestedVersion,
          )
        : undefined) ??
      findOriginalByCode(pages, PAGE_TYPES.SYSTEM_COMPONENT, code)
    )
  }

  const headerPage = pickByCode("header")
  const footerPage = pickByCode("footer")
  const headerCraft = headerPage?.content
    ? craftContentToComponents(headerPage.content, CRAFT_FRAGMENT_SCOPE.header)
    : {
        fragmentScope: CRAFT_FRAGMENT_SCOPE.header,
        components: [],
        styleClasses: {},
        orphanStyleNodes: [],
        stackedStyleClassIds: [],
      }
  const footerCraft = footerPage?.content
    ? craftContentToComponents(footerPage.content, CRAFT_FRAGMENT_SCOPE.footer)
    : {
        fragmentScope: CRAFT_FRAGMENT_SCOPE.footer,
        components: [],
        styleClasses: {},
        orphanStyleNodes: [],
        stackedStyleClassIds: [],
      }

  return {
    headerComponents: headerCraft.components,
    footerComponents: footerCraft.components,
    headerCraft,
    footerCraft,
  }
}

function readQueryString(value: string | string[] | undefined): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0]
    if (typeof first === "string") {
      const trimmed = first.trim()
      return trimmed.length > 0 ? trimmed : null
    }
  }
  return null
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
  const query: ParsedUrlQuery = context.query
  const hostHeader = "marketflow.store" // context.req.headers.host ?? "" //
  const domain = normalizeSiteDomain(hostHeader)

  if (!domain) {
    return { notFound: true }
  }

  const rawSlug =
    (context.params?.slug as string[] | undefined)?.join("/") ??
    readQueryString(query.slug) ??
    ""
  const slugPath =
    rawSlug.length === 0 ? "/" : rawSlug.startsWith("/") ? rawSlug : `/${rawSlug}`

  const { locale, slugPathWithoutLocale } = parseLocaleFromSlugPath(slugPath)

  const pages = await getSitePages(domain)

  if (!pages) {
    return { notFound: true }
  }

  const {
    headerComponents,
    footerComponents,
    headerCraft,
    footerCraft,
  } = resolveSystemLayoutComponents(pages, query)

  const { baseSlug, tailSlug } = splitBaseSlugAndTail(slugPathWithoutLocale)

  if (tailSlug === null) {
    const routingPage = findContentPage(pages, slugPathWithoutLocale)
    if (!routingPage?.content) {
      return { notFound: true }
    }

    const renderPageCandidate = findPreviewPageByOriginalCode(
      pages,
      query,
      routingPage,
    )
    if (!renderPageCandidate.content) {
      return { notFound: true }
    }

    const pageCraft = craftContentToComponents(
      renderPageCandidate.content,
      CRAFT_FRAGMENT_SCOPE.main,
    )
    if (pageCraft.components.length === 0) {
      return { notFound: true }
    }

    const pageBaseSlug = normalizeItemPathPrefix(routingPage.slug)
    //TODO временно получаем переводы из хардкода, в дальнейшем переводы прихоядт вместе со страницей
    const pageTranslate = getHardcodedTranslationsForPage(renderPageCandidate.id)

    const {
      collectionItemsByTypeId,
      initialSelectedCategoryIdByScope,
      initialSelectedCategorySlugByScope,
    } = await prefetchContentListPairs(domain, renderPageCandidate.content)

    return {
      props: {
        domain,
        slug: slugPathWithoutLocale,
        locale,
        pageTranslate,
        components: pageCraft.components,
        collectionItemsByTypeId,
        sitePages: pages,
        headerComponents,
        footerComponents,
        templateContentData: null,
        initialSelectedCategoryIdByScope,
        initialSelectedCategorySlugByScope,
        pageBaseSlug,
        categorySlugTrailFromUrl: null,
        craftCss: buildCraftPageCss(headerCraft, pageCraft, footerCraft),
      },
    }
  }

  const item = await fetchContentItemBySlug(domain, tailSlug)

  if (item) {
    const resolved = resolveTemplatePageForSlug(pages, slugPathWithoutLocale)
    if (!resolved) {
      return { notFound: true }
    }

    const routingPage = resolved.page
    const typeId = routingPage.collection_type_id?.trim()
    if (!typeId || !isTemplateSitePage(routingPage)) {
      return { notFound: true }
    }

    const itemTypeId = getItemContentTypeId(item)?.trim()
    if (
      !itemTypeId ||
      itemTypeId.toLowerCase() !== typeId.toLowerCase()
    ) {
      return { notFound: true }
    }

    const renderPageCandidate = findPreviewPageByOriginalCode(
      pages,
      query,
      routingPage,
    )
    if (!renderPageCandidate.content) {
      return { notFound: true }
    }

    const pageCraft = craftContentToComponents(
      renderPageCandidate.content,
      CRAFT_FRAGMENT_SCOPE.main,
    )
    if (pageCraft.components.length === 0) {
      return { notFound: true }
    }

    const templateContentData = {
      collectionKey: typeId,
      itemData: item,
    }

    const pairs = extractContentListPrefetchPairsFromCraftContent(
      renderPageCandidate.content,
    )
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
      routingPage.item_path_prefix ?? routingPage.slug,
    )
    const categorySlugTrailFromUrl = categoryTrailBetweenPrefixAndItemSlug(
      pageBaseSlug,
      slugPathWithoutLocale,
      tailSlug,
    )
    //TODO временно получаем переводы из хардкода, в дальнейшем переводы прихоядт вместе со страницей
    const pageTranslate = getHardcodedTranslationsForPage(renderPageCandidate.id)

    return {
      props: {
        domain,
        slug: slugPathWithoutLocale,
        locale,
        pageTranslate,
        components: pageCraft.components,
        collectionItemsByTypeId,
        sitePages: pages,
        headerComponents,
        footerComponents,
        templateContentData,
        initialSelectedCategoryIdByScope: EMPTY_CATEGORY_SCOPE,
        initialSelectedCategorySlugByScope: EMPTY_CATEGORY_SCOPE,
        pageBaseSlug,
        categorySlugTrailFromUrl,
        craftCss: buildCraftPageCss(headerCraft, pageCraft, footerCraft),
      },
    }
  }

  const category = await fetchContentCategoryBySlug(domain, tailSlug)
  if (!category) {
    return { notFound: true }
  }

  const routingPage = findContentPage(pages, baseSlug)
  if (!routingPage?.content) {
    return { notFound: true }
  }

  const renderPageCandidate = findPreviewPageByOriginalCode(
    pages,
    query,
    routingPage,
  )
  if (!renderPageCandidate.content) {
    return { notFound: true }
  }

  const pageCraft = craftContentToComponents(
    renderPageCandidate.content,
    CRAFT_FRAGMENT_SCOPE.main,
  )
  if (pageCraft.components.length === 0) {
    return { notFound: true }
  }

  const categorySlugForState =
    category.slug?.trim() || tailSlug.trim() || null

  const {
    collectionItemsByTypeId,
    initialSelectedCategoryIdByScope,
    initialSelectedCategorySlugByScope,
  } = await prefetchContentListPairs(domain, renderPageCandidate.content, {
    id: category.id,
    slug: categorySlugForState,
  })

  const pageBaseSlug = normalizeItemPathPrefix(routingPage.slug)
  const pageTranslate = getHardcodedTranslationsForPage(renderPageCandidate.id)

  return {
    props: {
      domain,
      slug: slugPathWithoutLocale,
      locale,
      pageTranslate,
      components: pageCraft.components,
      collectionItemsByTypeId,
      sitePages: pages,
      headerComponents,
      footerComponents,
      templateContentData: null,
      initialSelectedCategoryIdByScope,
      initialSelectedCategorySlugByScope,
      pageBaseSlug,
      categorySlugTrailFromUrl: categorySlugForState,
      craftCss: buildCraftPageCss(headerCraft, pageCraft, footerCraft),
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
  headerComponents,
  footerComponents,
  templateContentData,
  initialSelectedCategoryIdByScope,
  initialSelectedCategorySlugByScope,
  pageBaseSlug,
  categorySlugTrailFromUrl,
  craftCss,
}: PageProps) {
  const publicPath = prefixPublicPath(slug, locale)
  const ogUrlSuffix = publicPath === "/" ? "" : publicPath

  const main = (
    <main id="site-main">
      {renderPage(components)}
    </main>
  )

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
        {UPLOADED_FONTS_FACE_CSS ? ( //Регистируем шрифты
          <style
            id="uploaded-fonts-css"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: UPLOADED_FONTS_FACE_CSS }}
          />
        ) : null}
        {craftCss ? (
          <style
            id="craft-css"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: craftCss }}
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
              <header id="site-header">
                {renderPage(headerComponents)}
              </header>
              {inner}
              <footer id="site-footer">
                {renderPage(footerComponents)}
              </footer>
            </PageLocaleProvider>
          </StorefrontPageProvider>
        </CollectionFilterScopeProvider>
      </SiteCollectionsProvider>
    </>
  )
}
