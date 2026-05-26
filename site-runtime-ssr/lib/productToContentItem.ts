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

const readProductImage = (core: Record<string, unknown>): unknown => {
  if (core.image != null) return core.image
  if (core.image_url != null) return core.image_url
  if (core.preview_image != null) return core.preview_image
  return null
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
  const image = readProductImage(core)

  const fields: IContentItemField[] = [
    makeField("id", "ID", id),
    makeField("name", "Name", name),
    makeField("slug", "Slug", slug),
    makeField("image", "Image", image),
  ]

  return {
    id: id || slug || PRODUCTS_SELECTED_SOURCE,
    content_type_id: PRODUCTS_SELECTED_SOURCE,
    slug,
    fields,
  }
}
