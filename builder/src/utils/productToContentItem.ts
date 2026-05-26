import type { IContentItem, IContentItemField } from "../api/extranet"
import { PRODUCTS_SELECTED_SOURCE } from "../constants/contentListSources"
import type { IFullProduct } from "../hooks/useFullProduct.ts";
import type { IProduct } from "../store/productsApi.ts";

const readProductSlug = (core: IProduct): string => {
  const rawSlug = core.slug

  if (typeof rawSlug === "string" && rawSlug.trim()) {
    return rawSlug.trim()
  }

  return String(core.id)
}

const readProductBrandName = (core: Record<string, unknown>): string => {
  const brand = core.brand
  if (!brand || typeof brand !== "object") return ""
  const name = (brand as Record<string, unknown>).name
  return typeof name === "string" ? name : ""
}

const makeField = (id: string, name: string, value: string,): IContentItemField => (
  { id, field_type: "text", name, value, value_text: value, }
)

/**
 * преобразует /Products на схему как у кастомного контента, нужно для того что бы компоненты типа CraftContentList
 * работали с одним типом данных
 * TODO пока достаем только brand, name, description
 * */
export const mapFullProductToContentItem = (product: IFullProduct): IContentItem => {
  const core = product.core as Record<string, unknown>
  const id =
    typeof core.id === "number"
      ? String(core.id)
      : typeof core.id === "string"
        ? core.id
        : ""
  const slug = readProductSlug(core)
  const name = core.name as string ?? ""
  const brandName = readProductBrandName(core)
  const description = core.description as string ?? ""

  const fields: IContentItemField[] = [
    makeField("name", "Name", name),
    makeField("brand.name", "Brand Name", brandName),
    makeField("description", "Description", description),
  ]

  return {
    id: id || slug || PRODUCTS_SELECTED_SOURCE,
    content_type_id: PRODUCTS_SELECTED_SOURCE,
    slug,
    fields,
  }
}
