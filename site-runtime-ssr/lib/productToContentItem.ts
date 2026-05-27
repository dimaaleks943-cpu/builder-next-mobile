import type { IContentItem, IContentItemField } from "@/lib/contentTypes"
import { PRODUCTS_SELECTED_SOURCE } from "@/constants/contentListSources"
import type { IFullProduct } from "@/interfaces/productTypes"

const readProductSlug = (core: Record<string, unknown>): string => {
  const rawSlug = core.slug
  if (typeof rawSlug === "string" && rawSlug.trim()) {
    return rawSlug.trim()
  }
  const id = core.id
  if (typeof id === "number" && Number.isFinite(id)) {
    return String(id)
  }
  if (typeof id === "string" && id.trim()) {
    return id.trim()
  }
  return ""
}

const readProductName = (core: Record<string, unknown>): string => {
  const name = core.name
  return typeof name === "string" ? name : ""
}

const readProductBrandName = (core: Record<string, unknown>): string => {
  const brand = core.distributor_brand
  if (!brand || typeof brand !== "object") return ""
  const name = (brand as Record<string, unknown>).name
  return typeof name === "string" ? name : ""
}

const makeField = (
  id: string,
  name: string,
  value: unknown,
): IContentItemField => ({
  id,
  name,
  value,
  value_text:
    typeof value === "string" || typeof value === "number"
      ? String(value)
      : null,
})

export const mapFullProductToContentItem = (product: IFullProduct): IContentItem => {
  const core = product.core as Record<string, unknown>
  const id =
    typeof core.id === "number"
      ? String(core.id)
      : typeof core.id === "string"
        ? core.id
        : ""
  const slug = readProductSlug(core)
  const name = readProductName(core)
  const brand = readProductBrandName(core)
  const fields: IContentItemField[] = [
    makeField("id", "ID", id),
    makeField("name", "Name", name),
    makeField("brand.name", "Brand Name", brand),
    makeField("slug", "Slug", slug),
  ]

  return {
    id: id || slug || PRODUCTS_SELECTED_SOURCE,
    content_type_id: PRODUCTS_SELECTED_SOURCE,
    slug,
    fields,
  }
}
