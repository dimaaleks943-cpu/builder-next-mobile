export enum PAGE_VISIBILITY {
  ACTIVE = "active",
  NOINDEX = "noindex",
  RESTRICTED = "restricted",
}

export enum PAGE_TYPES {
  STATIC = "static",
  TEMPLATE = "template",
  SYSTEM_COMPONENT = "system_component",
  SYSTEM_PAGE = "system_page",
}

export interface SitePage {
  id: string
  name: string
  slug: string
  content: string
  type: PAGE_TYPES
  version: string | null
  code: string | null
  visibility: PAGE_VISIBILITY
  collection_type_id?: string | null
  item_path_prefix?: string | null
  /**
   * Порядок страницы из API; при равной длине префикса template выбирается меньший sort.
   * Публичный GET /pages может не отдавать.
   */
  sort?: number | null
}

export interface SitePagesResponse {
  data: SitePage[]
  links: unknown | null
}

/** Домен из заголовка Host может содержать порт (example.com:3000) — отбрасываем порт. */
export function normalizeSiteDomain(domain: string): string {
  return domain.includes(":") ? domain.split(":")[0]! : domain
}

// Получаем список страниц для домена через публичный GET /{domain}/pages
export const getSitePages = async (
  domain: string,
): Promise<SitePage[] | null> => {
  const cleanDomain = normalizeSiteDomain(domain)

  try {
    const apiUrl = process.env.API_URL || "https://dev-api.cezyo.com"
    const response = await fetch(
      `${apiUrl}/v3/sites/${cleanDomain}/pages`,
    )

    if (!response.ok) {
      console.error(
        `Не удалось получить страницы для домена ${cleanDomain}:`,
        response.status,
        response.statusText,
      )
      return null
    }

    const json: SitePagesResponse = await response.json()
    return json.data
  } catch (error) {
    console.error(`Ошибка при запросе страниц для домена ${domain}:`, error)
    return null
  }
}

export function findOriginalByCode(
  pages: SitePage[],
  type: PAGE_TYPES,
  code: string,
): SitePage | undefined {
  return pages.find(
    (page) =>
      page.type === type && page.code === code && page.version === null,
  )
}

export function findVersionByCode(
  pages: SitePage[],
  type: PAGE_TYPES,
  code: string,
  version: string,
): SitePage | undefined {
  return pages.find(
    (page) =>
      page.type === type && page.code === code && page.version === version,
  )
}

