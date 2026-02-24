// Заглушка API для получения коллекций (в будущем будет заменена на реальное API)
// Пока используем ту же API что и в builder для получения продуктов

export type CollectionInfo = {
  key: string
  label: string
  items: any[]
}

export type CollectionsMap = Record<string, CollectionInfo>

const API_BASE_URL = process.env.API_URL || "https://dev-api.cezyo.com"

/**
 * Получает коллекцию продуктов из API (заглушка)
 * В будущем здесь будет реальное API для получения разных типов коллекций
 */
export const fetchProductsCollection = async (): Promise<any[] | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/v3/client/catalog/products?limit=10&filter=%7B%7D`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      console.error(
        "Не удалось получить коллекцию products:",
        response.status,
        response.statusText
      )
      return null
    }

    const json: { data: any[] } = await response.json()
    return json.data || []
  } catch (error) {
    console.error("Ошибка при запросе коллекции products:", error)
    return null
  }
}

/**
 * Получает все доступные коллекции (заглушка)
 * В будущем здесь будет запрос к реальному API для получения списка коллекций
 */
export const fetchCollections = async (): Promise<CollectionsMap> => {
  const products = await fetchProductsCollection()

  const collections: CollectionsMap = {}

  if (products && products.length > 0) {
    collections.products = {
      key: "products",
      label: "Products",
      items: products,
    }
  }

  return collections
}

/**
 * Получает конкретную коллекцию по ключу
 */
export const getCollectionByKey = async (
  key: string
): Promise<CollectionInfo | null> => {
  const collections = await fetchCollections()
  return collections[key] || null
}
