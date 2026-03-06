import { RUNTIME_API_BASE_URL, RUNTIME_SITE_DOMAIN, cleanDomain } from "./config";

export interface SitePage {
  id: string;
  name: string;
  slug: string;
  content: string;
}

export interface SitePagesResponse {
  data: SitePage[];
  links: unknown | null;
}

/**
 * Получить список страниц для домена, по тому же контракту,
 * который использует site-runtime-ssr (`lib/sitePages.ts`).
 */
export const fetchSitePages = async (
  domain: string = RUNTIME_SITE_DOMAIN,
): Promise<SitePage[] | null> => {
  const domainClean = cleanDomain(domain);

  try {
    const response = await fetch(
      `${RUNTIME_API_BASE_URL}/v3/sites/${domainClean}/pages`,
    );

    if (!response.ok) {
      console.error(
        "[mobileApp] Failed to fetch site pages:",
        domainClean,
        response.status,
        response.statusText,
      );
      return null;
    }

    const json = (await response.json()) as SitePagesResponse;
    return json.data;
  } catch (error) {
    console.error(
      "[mobileApp] Network error while fetching site pages:",
      domainClean,
      error,
    );
    return null;
  }
};

/**
 * Получить одну страницу по slug ("/", "/about" и т.п.) для текущего домена.
 * Логика совпадает с pages/[[...slug]].tsx в site-runtime-ssr.
 */
export const fetchSitePageBySlug = async (
  slugPath: string,
  domain: string = RUNTIME_SITE_DOMAIN,
): Promise<SitePage | null> => {
  const pages = await fetchSitePages(domain);
  if (!pages) return null;

  const normalized =
    slugPath.length === 0 ? "/" : slugPath.startsWith("/") ? slugPath : `/${slugPath}`;

  const page =
    pages.find((p) => p.slug === normalized) ||
    (normalized === "/" ? pages.find((p) => p.slug === "/") : undefined);

  return page ?? null;
};

