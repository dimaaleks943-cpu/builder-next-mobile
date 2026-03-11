import { API_BASE_URL } from "./config";

export type CollectionInfo = {
  key: string;
  label: string;
  items: any[];
};

export type CollectionsMap = Record<string, CollectionInfo>;

/** TODO заглушка загружает коллекцию продуктов с API бэкенда для блоков типа ContentList. */
export const fetchProductsCollection = async (): Promise<any[] | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/v3/client/catalog/products?limit=10&filter=%7B%7D`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const json = (await response.json()) as { data: any[] };
    return json.data || [];
  } catch (error) {
    return null;
  }
};

export const fetchCollections = async (): Promise<CollectionsMap> => {
  const products = await fetchProductsCollection();

  const collections: CollectionsMap = {};

  if (products && products.length > 0) {
    collections.products = {
      key: "products",
      label: "Products",
      items: products,
    };
  }

  return collections;
};

export const getCollectionByKey = async (
  key: string,
): Promise<CollectionInfo | null> => {
  const collections = await fetchCollections();
  return collections[key] || null;
};

