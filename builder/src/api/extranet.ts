// TODO: в будущем лучше вынести токен в .env и не хранить в репозитории


import type { IProduct } from "../intercafes/product/product.ts";


/** Корень API Cezyo (v2 Products и прочие legacy extranet endpoints). */
export const EXTRANET_API_ROOT = "https://dev-api.cezyo.com"

/** База для extranet pages API и content API (см. GET …/v3/sites/extranet/…). */
export const EXTRANET_SITES_BASE =
  "https://dev-api.cezyo.com/v3/sites/extranet"

export enum PageType {
  STATIC = "static",
  TEMPLATE = "template",
  SYSTEM_COMPONENT = "system_component",
  SYSTEM_PAGE = "system_page",
}

export const SUPPORTED_LOCALES = ["ru", "en"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export type LocaleTranslations = Record<string, string>
export type TranslationsByLocale = Record<Locale, LocaleTranslations>

export interface ExtranetPage {
  id: string
  site_id: number
  directory_id: string | null
  name: string
  slug: string
  type: PageType
  content_types: string[]
  item_path_prefix: string | null
  collection_type_id: string | null
  catalog_path_enabled?: boolean | null
  catalog_category_root_id?: string | null
  content: string
  /** JSON-дерево для мобилки (конструктор RN). Отдельно от content (веб). */
  content_mobile?: string | null
  translate?: TranslationsByLocale | null
  translate_mobile?: TranslationsByLocale | null
  sort: number
  created_at: string
  updated_at: string
  version: string | null;
  code: string | null;
  mode: PAGE_MODES;
  visibility: PAGE_VISIBILITY;
}

export enum PAGE_MODES {
  COMMON = "common",
  PLATFORM  = "platform",
}

export enum PAGE_VISIBILITY {
  ACTIVE = "active",
  NO_INDEX  = "noindex",
  RESTRICTED  = "restricted",
}


export interface ExtranetPagesResponse {
  data: ExtranetPage[]
  links: unknown | null
}

export interface ExtranetPageResponse {
  data: ExtranetPage
  links: unknown | null
}

export interface PaginatedResponse<T> {
  data: T[]
  links: unknown | null
}

export enum CONTENT_REFERENCE_TYPES {
  CONTENT_CATEGORIES = "category",
  CONTENT_ITEMS = "item",
}

export enum CONTENT_FIELD_TYPES {
  TEXT = "text",
  NUMERIC = "numeric",
  BOOLEAN = "boolean",
}

/**
 * Определение поля типа контента. Схема задаётся пользователем в extranet — фиксированной
 * структуры ключей нет, поэтому допускаются произвольные поля с бэкенда.
 */
export interface IContentTypeField {
  id: string;
  content_type_id?: string;
  reference_type: CONTENT_REFERENCE_TYPES;
  field_type: CONTENT_FIELD_TYPES;
  name: string;
}

export interface ContentType {
  id: string
  name: string
  slug?: string
  has_categories?: boolean
  fields?: IContentTypeField[]
  [key: string]: unknown
}

/** Элемент списка категорий контента (GET …/content/categories). */
export interface ContentCategory {
  id: string
  name: string
  slug?: string
  sort?: number
  parent_id?: string | null
  [key: string]: unknown
}

/**
 * Значение поля у экземпляра контента. Набор `value_*` и смысл `value` зависят от типа поля
 * и настроек пользователя — не типизируем как жёсткую строку/объект фиксированной формы.
 */
export interface IContentItemField {
  id: string
  field_type?: string
  name?: string
  value?: unknown
  value_text?: string | null
  value_float?: number | null
  value_boolean?: boolean | null
  [key: string]: unknown
}

export interface IContentItemCategory {
  item_id?: string;
  category_id: string;
  sort: number;
}

export interface IContentItem {
  id: string;
  content_type_id: string;
  categories: IContentItemCategory[];
  name: string;
  slug: string;
  active: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
  fields: IContentItemField[];
}


/** Контент товара поставщика для сайта (`GET …/content/distributor/products`). */
export interface IDistributorProductContent {
  id?: string
  distributor_id?: number
  product_id?: number
  fields?: IContentItemField[]
  [key: string]: unknown
}

export interface ProductsListResponse {
  data: IProduct[]
  total: number
}

export interface ProductsListQueryParams {
  range?: [number, number]
  filter?: Record<string, unknown>
  sort?: unknown
  with?: string
  [key: string]: unknown
}

export interface DistributorProductsQueryParams {
  filter?: Record<string, unknown>
  limit?: number
  offset?: number
  [key: string]: unknown
}

/** Категория поставщика из extranet v2 (`GET …/v2/DistributorCategories`). */
export interface IDistributorCategory {
  id: number
  name: string
  slug: string
  sort: number
  distributor_id: number
  category_id: number | null
  needs_moderation: boolean
  external_data: unknown
  created_at: string
  updated_at: string
  active: boolean
  has_children: boolean
  Products_Count: number
  Self_Products_Count: number
}

export interface DistributorCategoriesFilter {
  distributor_id: number
}

export interface DistributorCategoriesQueryParams {
  parent_id?: number | null
  filter?: DistributorCategoriesFilter
}
