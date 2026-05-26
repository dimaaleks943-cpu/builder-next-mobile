import type { IContentTypeField } from "../api/extranet"

//selected source храним в content_types, который нужен для проверки перед удалением контента, что данный
//контент нигде не используется на страницах, пока хардкод что бы не получать ошиьку от бека "30007127-a7f2-4629-9d68-e1fca18e1551"
export const PRODUCTS_SELECTED_SOURCE = "30007127-a7f2-4629-9d68-e1fca18e1551"

export const isProductsSelectedSource = (source: string): boolean =>
  source.trim() === PRODUCTS_SELECTED_SOURCE

/** список полей для ContentList который предлагает /Products */
export const PRODUCT_BINDABLE_FIELDS: IContentTypeField[] = [
  { id: "name", name: "Name", field_type: "text" },
  { id: "brand.name", name: "Brand Name", field_type: "text" },
  { id: "description", name: "Description", field_type: "text" },
]
