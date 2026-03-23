export interface SitePage {
  id: string
  name: string
  slug: string
  content: string
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

