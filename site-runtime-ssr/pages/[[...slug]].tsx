import type { GetServerSideProps, GetServerSidePropsResult } from "next"
import Head from "next/head"
import { renderPage } from "@/lib/renderer"
import type { ComponentNode } from "@/lib/interface"
import { getSitePages, normalizeSiteDomain, type SitePage } from "@/lib/sitePages"
import { craftContentToComponents } from "@/lib/craftContentToComponents"
import { fetchContentItemById, fetchContentItems } from "@/lib/collectionsApi"
import { extractContentListTypeIdsFromCraftContent } from "@/lib/extractContentListSources"
import type { IContentItem } from "@/lib/contentTypes"
import { SiteCollectionsProvider } from "@/components/SiteCollectionsContext"
import { ContentDataProvider } from "@/components/ContentDataContext"
import {
  findContentItemByUrlSegment,
  isTemplateSitePage,
  isUuidLikePathSegment,
  resolveTemplatePageForSlug,
} from "@/lib/templateRoute"

interface PageProps {
  domain: string
  slug: string
  components: ComponentNode[]
  collectionItemsByTypeId: Record<string, IContentItem[]>
  sitePages: SitePage[]
  /** Данные записи для template-страницы (поля Text/Image вне ContentList). */
  templateContentData: {
    collectionKey: string
    itemData: IContentItem
  } | null
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
): Promise<GetServerSidePropsResult<PageProps>> => {
  const hostHeader = "marketflow.store" // context.req.headers.host ?? "" //
  const domain = normalizeSiteDomain(hostHeader)

  if (!domain) {
    return { notFound: true }
  }

  // 2. Определяем slug из catch-all-роута:
  // "/" -> slug пустой -> считаем, что это корень "/"
  const rawSlug = (context.params?.slug as string[] | undefined)?.join("/") ?? ""
  const slugPath =
    rawSlug.length === 0 ? "/" : rawSlug.startsWith("/") ? rawSlug : `/${rawSlug}`

  console.log(`[SSR] Rendering page for domain=${domain}, slug=${slugPath}`)

  // 3. Получаем с бэкенда список страниц для домена
  const pages = await getSitePages(domain)

  if (!pages) {
    return { notFound: true }
  }

  // 4. Статическая страница: точное совпадение slug; template-страницы с тем же slug не берём
  // (для них нужен хвост пути с записью коллекции).
  const isStaticPage = (p: SitePage) => !isTemplateSitePage(p)

  let page: SitePage | undefined =
    pages.find((p) => p.slug === slugPath && isStaticPage(p)) ||
    (slugPath === "/"
      ? pages.find((p) => p.slug === "/" && isStaticPage(p))
      : undefined)

  let templateItemSegment: string | null = null

  if (!page) {
    const resolved = resolveTemplatePageForSlug(pages, slugPath)
    if (resolved) {
      page = resolved.page
      templateItemSegment = resolved.itemSegment
    }
  }

  if (!page || !page.content) {
    return { notFound: true }
  }

  // 5. Преобразуем content из формата Craft.js в ComponentNode[],
  // который уже умеет рендерить site-runtime-ssr
  const components = craftContentToComponents(page.content)

  if (components.length === 0) {
    return { notFound: true }
  }

  const contentListTypeIds = extractContentListTypeIdsFromCraftContent(
    page.content,
  )
  const collectionItemsByTypeId: Record<string, IContentItem[]> = {}

  let templateContentData: PageProps["templateContentData"] = null

  if (isTemplateSitePage(page) && page.collection_type_id?.trim()) {
    //@ts-ignore
    const typeId = page.collection_type_id.trim()

    if (!templateItemSegment) {
      return { notFound: true }
    }

    if (isUuidLikePathSegment(templateItemSegment)) {
      const byId = await fetchContentItemById(domain, templateItemSegment)
      if (!byId) {
        return { notFound: true }
      }
      const raw = byId as Record<string, unknown>
      const itemTypeId =
        (typeof byId.content_type_id === "string"
          ? byId.content_type_id
          : undefined) ??
        (typeof raw.collection_type_id === "string"
          ? raw.collection_type_id
          : undefined)
      if (
        !itemTypeId ||
        itemTypeId.trim().toLowerCase() !== typeId.toLowerCase()
      ) {
        return { notFound: true }
      }
      collectionItemsByTypeId[typeId] = [byId]
      templateContentData = { collectionKey: typeId, itemData: byId }
    } else {
      const items = (await fetchContentItems(domain, typeId)) ?? []
      collectionItemsByTypeId[typeId] = items
      const item = findContentItemByUrlSegment(items, templateItemSegment)
      if (!item) {
        return { notFound: true }
      }
      templateContentData = { collectionKey: typeId, itemData: item }
    }
  }

  const extraTypeIds = contentListTypeIds.filter(
    (id) => collectionItemsByTypeId[id] === undefined,
  )

  if (extraTypeIds.length > 0) {
    const batches = await Promise.all(
      extraTypeIds.map(async (typeId) => {
        const data = await fetchContentItems(domain, typeId)
        return [typeId, data ?? []] as const
      }),
    )
    for (const [typeId, items] of batches) {
      collectionItemsByTypeId[typeId] = items
    }
  }

  return {
    props: {
      domain,
      slug: slugPath,
      components,
      collectionItemsByTypeId,
      sitePages: pages,
      templateContentData,
    },
  }
}

export default function Page({
  domain,
  slug,
  components,
  collectionItemsByTypeId,
  sitePages,
  templateContentData,
}: PageProps) {
  const urlPath = slug === "/" ? "" : slug

  const main = (
    <main style={{ minHeight: "100vh", padding: "20px" }}>
      {renderPage(components)}
    </main>
  )

  return (
    <>
      <Head>
        <title>{`Страница ${slug} — ${domain}`}</title>
        <meta property="og:title" content={`Страница ${slug} — ${domain}`} />
        <meta property="og:url" content={`https://${domain}${urlPath}`} />
      </Head>
      <SiteCollectionsProvider
        domain={domain}
        collectionItemsByTypeId={collectionItemsByTypeId}
        sitePages={sitePages}
      >
        {templateContentData ? (
          <ContentDataProvider
            collectionKey={templateContentData.collectionKey}
            itemData={templateContentData.itemData}
          >
            {main}
          </ContentDataProvider>
        ) : (
          main
        )}
      </SiteCollectionsProvider>
    </>
  )
}
