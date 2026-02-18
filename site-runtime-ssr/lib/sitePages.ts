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

// Получаем список страниц для домена через публичный GET /{domain}/pages
export const getSitePages = async (
  domain: string,
): Promise<SitePage[] | null> => {
  // домен из заголовка может содержать порт (marketflow.store:3000) — срезаем порт
  const cleanDomain = domain.includes(":")
    ? domain.split(":")[0]
    : domain

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

