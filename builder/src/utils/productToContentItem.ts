import type { IContentItem, IContentItemField } from "../api/extranet"
import { PRODUCTS_SELECTED_SOURCE } from "../constants/contentListSources"
import type { IFullProduct } from "../hooks/useFullProduct.ts";
import type { IProduct } from "../intercafes/product/product.ts";

const readProductSlug = (core: IProduct): string => {
  const rawSlug = core.slug

  if (typeof rawSlug === "string" && rawSlug.trim()) {
    return rawSlug.trim()
  }

  return String(core.id)
}

const readProductBrandName = (core: IProduct): string =>
  core.brand?.name ?? ""

const makeField = (id: string, name: string, value: string,): IContentItemField => (
  { id, field_type: "text", name, value, value_text: value, }
)

/**
 * преобразует /Products на схему как у кастомного контента, нужно для того что бы компоненты типа CraftContentList
 * работали с одним типом данных
 * TODO пока достаем только brand, name, description
 * */
export const mapFullProductToContentItem = (product: IFullProduct): IContentItem => {
  const core = product.core;
  const id = String(core.id);
  const slug = readProductSlug(core);
  const name = core.name ?? "";
  const brandName = readProductBrandName(core);
  const description = core.description ?? "";

  const fields: IContentItemField[] = [
    makeField("name", "Name", name),
    makeField("brand.name", "Brand Name", brandName),
    makeField("description", "Description", description),
  ]

  return {
    id: id || slug || PRODUCTS_SELECTED_SOURCE,
    content_type_id: PRODUCTS_SELECTED_SOURCE,
    categories: [],
    name,
    slug,
    active: true,
    sort: 0,
    created_at: "",
    updated_at: "",
    fields,
  }
}
