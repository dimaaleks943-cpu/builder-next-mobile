/** Sentinel value stored in Craft JSON when ContentList source is Products. */
export const PRODUCTS_SELECTED_SOURCE = "30007127-a7f2-4629-9d68-e1fca18e1551" // "__products__"

export const isProductsSelectedSource = (source: string): boolean => source.trim() === PRODUCTS_SELECTED_SOURCE
