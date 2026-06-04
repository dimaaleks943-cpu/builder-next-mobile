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
import {
  fetchCollectionItemsBySource,
} from "@/lib/collectionsApi"
import {
  extractContentListPrefetchPairsFromCraftContent,
} from "@/lib/extractContentListSources"
import { getCollectionItemsCacheKey } from "@/lib/collectionItemsCacheKey"
import {
  itemMatchesPageCollectionType,
  parseStorefrontPath,
  resolveCategoryFromTrail,
  resolveRenderablePage,
  resolveTailForStaticSystemPage,
  resolveTailForTemplatePage,
  fetchTemplateItemForPage,
} from "@/lib/pagePathResolve"
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
  isStaticSitePage,
  isSystemPageSitePage,
  isTemplateSitePage,
  normalizeItemPathPrefix,
} from "@/lib/templateRoute"
import { getUploadedFontsFaceCss } from "@/lib/fonts/uploadedFontsRegistry"

const UPLOADED_FONTS_FACE_CSS = getUploadedFontsFaceCss()

const renderPageOrNotFound = async (
  domain: string,
  query: ParsedUrlQuery,
  pages: SitePage[],
  routingPage: SitePage,
  headerComponents: ComponentNode[],
  footerComponents: ComponentNode[],
  headerCraft: ReturnType<typeof craftContentToComponents>,
  footerCraft: ReturnType<typeof craftContentToComponents>,
  locale: SsrLocale,
  slugPathWithoutLocale: string,
  pageBaseSlug: string,
  categorySlugTrailFromUrl: string | null,
  templateContentData: PageProps["templateContentData"],
  category?: { id: string; slug?: string | null },
): Promise<GetServerSidePropsResult<PageProps>> => {
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

  const pageTranslate = getHardcodedTranslationsForPage(renderPageCandidate.id)

  const {
    collectionItemsByTypeId,
    initialSelectedCategoryIdByScope,
    initialSelectedCategorySlugByScope,
  } = await prefetchContentListPairs(
    domain,
    renderPageCandidate.content,
    category,
    templateContentData,
  )

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
      initialSelectedCategoryIdByScope,
      initialSelectedCategorySlugByScope,
      pageBaseSlug,
      categorySlugTrailFromUrl,
      craftCss: buildCraftPageCss(headerCraft, pageCraft, footerCraft),
    },
  }
}

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
  /** Данные записи для template-страницы (поля Heading/Paragraph/Image вне ContentList). */
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

const findPreviewPageByOriginalCode = (
  pages: SitePage[],
  query: ParsedUrlQuery,
  originalPage: SitePage,
): SitePage => {
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
  templateContentData?: PageProps["templateContentData"],
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
      const data = await fetchCollectionItemsBySource(
        domain,
        pair.selectedSource,
        {
          categoryIds: useCat && category ? [category.id] : undefined,
        },
      )
      collectionItemsByTypeId[key] = data ?? []
    }),
  )

  if (templateContentData) {
    const typeIdLower = templateContentData.collectionKey.trim().toLowerCase()
    for (const pair of pairs) {
      if (
        pair.selectedSource.trim().toLowerCase() === typeIdLower
      ) {
        const key = getCollectionItemsCacheKey(
          pair.filterScope,
          pair.selectedSource,
        )
        collectionItemsByTypeId[key] = [templateContentData.itemData]
      }
    }
    if (
      collectionItemsByTypeId[templateContentData.collectionKey] === undefined
    ) {
      collectionItemsByTypeId[templateContentData.collectionKey] = [
        templateContentData.itemData,
      ]
    }
  }

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

  const parsedPath = parseStorefrontPath(slugPathWithoutLocale)
  const routingPage = resolveRenderablePage(pages, parsedPath.pageSlugSegment)

  if (!routingPage?.content) {
    return { notFound: true }
  }

  const pageBaseSlug = normalizeItemPathPrefix(routingPage.slug)
  const tailSegments = parsedPath.tailSegments

  if (tailSegments.length === 0) {
    return renderPageOrNotFound(
      domain,
      query,
      pages,
      routingPage,
      headerComponents,
      footerComponents,
      headerCraft,
      footerCraft,
      locale,
      slugPathWithoutLocale,
      pageBaseSlug,
      null,
      null,
    )
  }

  if (isTemplateSitePage(routingPage)) {
    const { itemSlug, categorySlugTrail } =
      resolveTailForTemplatePage(tailSegments)
    if (!itemSlug.trim()) {
      return { notFound: true }
    }

    const typeId = routingPage.collection_type_id?.trim()
    if (!typeId) {
      return { notFound: true }
    }

    const item = await fetchTemplateItemForPage(domain, itemSlug, typeId)
    if (!item || !itemMatchesPageCollectionType(item, typeId)) {
      return { notFound: true }
    }

    const templateContentData = {
      collectionKey: typeId,
      itemData: item,
    }

    return renderPageOrNotFound(
      domain,
      query,
      pages,
      routingPage,
      headerComponents,
      footerComponents,
      headerCraft,
      footerCraft,
      locale,
      slugPathWithoutLocale,
      pageBaseSlug,
      categorySlugTrail,
      templateContentData,
    )
  }

  if (isStaticSitePage(routingPage) || isSystemPageSitePage(routingPage)) {
    const tailResult = await resolveTailForStaticSystemPage(domain, tailSegments)
    if (!tailResult) {
      return { notFound: true }
    }

    if (tailResult.mode === "inline-item") {
      const templateContentData = {
        collectionKey: tailResult.collectionKey,
        itemData: tailResult.item,
      }

      return renderPageOrNotFound(
        domain,
        query,
        pages,
        routingPage,
        headerComponents,
        footerComponents,
        headerCraft,
        footerCraft,
        locale,
        slugPathWithoutLocale,
        pageBaseSlug,
        tailResult.categorySlugTrail,
        templateContentData,
      )
    }

    const category = await resolveCategoryFromTrail(
      domain,
      tailSegments,
    )
    if (!category) {
      return { notFound: true }
    }

    return renderPageOrNotFound(
      domain,
      query,
      pages,
      routingPage,
      headerComponents,
      footerComponents,
      headerCraft,
      footerCraft,
      locale,
      slugPathWithoutLocale,
      pageBaseSlug,
      tailResult.categorySlugTrail,
      null,
      category,
    )
  }

  return { notFound: true }
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
