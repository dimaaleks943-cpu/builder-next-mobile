import type { GetServerSideProps, GetServerSidePropsResult } from "next"
import Head from "next/head"
import { getSiteConfig } from "@/lib/siteConfig"
import type { PageConfig } from "@/lib/siteConfig"
import { renderPage } from "@/lib/renderer"

interface PageProps {
  page: PageConfig
  domain: string
  metadata?: {
    title?: string
    description?: string
  }
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
): Promise<GetServerSidePropsResult<PageProps>> => {
  // берем домен из загаловка
  const domain = context.req.headers.host || "localhost:3000"

  console.log(`[SSR] Rendering page for domain: ${domain}`)

  // Запрашиваем конфигурацию для этого домена (пока мокавые)
  const siteConfig = await getSiteConfig(domain)

  if (!siteConfig) {
    return { notFound: true }
  }

  // Определяем slug страницы (catch-all: "/" -> slug пустой -> "index")
  const slug = (context.params?.slug as string[] | undefined)?.length
    ? (context.params?.slug as string[]).join("/")
    : "index"

  // Находим нужную страницу
  const page = siteConfig.pages[slug] || siteConfig.pages["index"]

  if (!page) {
    return { notFound: true }
  }

  // отдаём данные — Next.js рендерит HTML на сервере
  return {
    props: {
      page,
      domain,
      metadata: siteConfig.metadata,
    },
  }
}

export default function Page({ page, domain, metadata }: PageProps) {
  return (
    <>
      <Head>
        <title>{metadata?.title || domain}</title>
        {metadata?.description && (
          <meta name="description" content={metadata.description} />
        )}
        <meta property="og:title" content={metadata?.title || domain} />
        <meta property="og:url" content={`https://${domain}`} />
      </Head>
      <main style={{ minHeight: "100vh", padding: "20px" }}>
        {renderPage(page.components)}
      </main>
    </>
  )
}
