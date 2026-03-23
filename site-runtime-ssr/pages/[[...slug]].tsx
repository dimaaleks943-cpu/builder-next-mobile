import type { GetServerSideProps, GetServerSidePropsResult } from "next"
import Head from "next/head"
import { renderPage } from "@/lib/renderer"
import type { ComponentNode } from "@/lib/interface"
import { getSitePages, normalizeSiteDomain } from "@/lib/sitePages"
import { craftContentToComponents } from "@/lib/craftContentToComponents"
import { fetchContentItems } from "@/lib/collectionsApi"
import { extractContentListTypeIdsFromCraftContent } from "@/lib/extractContentListSources"
import type { IContentItem } from "@/lib/contentTypes"
import { SiteCollectionsProvider } from "@/components/SiteCollectionsContext"

interface PageProps {
  domain: string
  slug: string
  components: ComponentNode[]
  collectionItemsByTypeId: Record<string, IContentItem[]>
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
): Promise<GetServerSidePropsResult<PageProps>> => {
  const hostHeader = context.req.headers.host ?? "" //marketflow.store
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

  // 4. Ищем нужную страницу по slug. Как корень используем "/"
  const page =
    pages.find((p) => p.slug === slugPath) ||
    (slugPath === "/" ? pages.find((p) => p.slug === "/") : undefined)

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

  if (contentListTypeIds.length > 0) {
    const batches = await Promise.all(
      contentListTypeIds.map(async (typeId) => {
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
    },
  }
}

export default function Page({
  domain,
  slug,
  components,
  collectionItemsByTypeId,
}: PageProps) {
  const urlPath = slug === "/" ? "" : slug

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
      >
        <main style={{ minHeight: "100vh", padding: "20px" }}>
          {renderPage(components)}
        </main>
      </SiteCollectionsProvider>
    </>
  )
}
