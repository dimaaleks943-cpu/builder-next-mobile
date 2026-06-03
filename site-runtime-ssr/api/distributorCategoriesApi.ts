import type {
  DistributorCategoriesResponse,
  DistributorCategoryNode,
} from "@/interfaces/distributorCategoryTypes"
import type { ContentCategory } from "@/lib/contentTypes"

const API_BASE_URL = process.env.API_URL || "https://dev-api.cezyo.com"

const DISTRIBUTOR_CATEGORIES_ENDPOINT = "/v3/client/catalog/distributors/1/categories"
const HARDCODED_SITE_ID_HEADER = "1"

const normalizeDistributorCategoriesResponse = (
  json: unknown,
): DistributorCategoryNode[] => {
  if (
    json &&
    typeof json === "object" &&
    (json as DistributorCategoriesResponse).data &&
    typeof (json as DistributorCategoriesResponse).data === "object" &&
    Array.isArray((json as DistributorCategoriesResponse).data?.categories)
  ) {
    return (json as DistributorCategoriesResponse).data?.categories ?? []
  }
  return []
}

const mapDistributorCategoryToContentCategory = (
  node: DistributorCategoryNode,
): ContentCategory => ({
  id: String(node.id),
  name: node.name,
  slug: node.slug,
  sort: node.sort,
})

export const fetchDistributorCategories = async (): Promise<
  ContentCategory[] | null
> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${DISTRIBUTOR_CATEGORIES_ENDPOINT}`,
      {
        headers: {
          "Site-Id": HARDCODED_SITE_ID_HEADER,
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      console.error(
        "Failed to fetch distributor categories:",
        response.status,
        response.statusText,
      )
      return null
    }

    const json: unknown = await response.json()
    const nodes = normalizeDistributorCategoriesResponse(json)
    return nodes.map(mapDistributorCategoryToContentCategory)
  } catch (error) {
    console.error("Error fetching distributor categories:", error)
    return null
  }
}
