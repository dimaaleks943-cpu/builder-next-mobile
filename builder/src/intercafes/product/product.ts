import type { IProductBrand } from "./productBrand.ts";
import type { IProductImag } from "./productImage.ts";
import type { IProductVariation } from "./productVariation.ts";
import type { IProductVersions } from "./productVersion.ts";


export interface IProductImagesItem {
  group_property_value_id: number | null;
  id: string;
  image_original_name: string;
  image_small_url: string;
  image_url: string;
  moderation_info: Record<string, string | boolean> | null;
  moderator_id: number | null;
  product_id: number;
  sort: number;
  status: string;
  moderation_uuid: string | null;
  moderation_date: string | null;
}

export interface IProductImagesModel {
  categories: { id: number; distributor_id: number; name: string }[];
  distributor_id: number;
  id: number;
  images: IProductImagesItem[];
  name: string;
}

export enum ProductBaseUnit {
  DAYS = "days",
  MONTHS = "months",
  YEARS = "years",
}

export const productBaseUnitToString = (unit: ProductBaseUnit) => {
  switch (unit) {
    case ProductBaseUnit.DAYS:
      return "Дни";

    case ProductBaseUnit.MONTHS:
      return "Месяцы";

    case ProductBaseUnit.YEARS:
      return "Годы";

    default:
      return "Неизвестно";
  }
};

export interface IProductCategory {
  id: number | null;
  distributor_id: number | null;
  name: string | null;
  parent_id: number | null;
}

export interface IProductImage {
  id: string;
  sort: number | null;
  status: string;
  group_property_value_id: number | null;
  urls: {
    original: string;
    small: string;
  };
}

export interface IProduct {
  id: number;
  distributor_size_sheet_id: number | null; //
  distributor_id: number | null; //ID поставщика
  country_code: string | null; //Код страны-производителя
  description: string | null; //описание
  components: string | null; //комплектация (описание)
  variable: boolean; //товар вариативный
  is_adult: boolean; //товар 18+
  enable_sizes_table: boolean; //отображение таблицы размеров
  single_package_sizes: boolean; //одинаковые размеры упаковки для всех вариаций
  is_food: boolean; //пищевой продукт
  name: string; //название
  active: boolean; //товар активен и готов к продаже (переключатель)
  status: ProductStatus; //статус товара (не меняется со стороны поставщика)
  slug: string | null;
  moderation: boolean;
  distributor_brand_id: number;
  sorting: number;
  rating: number | null;
  reject_reason: string | null; // причина отказа
  orders_count: number;
  group_property_id: number | null; //параметр который влияет на внешний вид
  brand: IProductBrand;
  features: number[];
  delivery_features: number[];
  categories: IProductCategory[];
  images: IProductImag[];
  updated_at: string;
  from_version?: string;
  //через with
  ProductVariations: IProductVariation[];
  ProductVersions: IProductVersions[];

  shelf_life: number; //параметры, связанные со сроком годности
  shelf_life_unit: ProductBaseUnit; //параметры, связанные со сроком годности
  shelf_life_comment: string; //параметры, связанные со сроком годности
  service_life: number; //параметры, связанные со сроком службы
  service_life_unit: ProductBaseUnit; //параметры, связанные со сроком службы
  service_life_comment: string; //параметры, связанные со сроком службы
  warranty: number; //параметры, связанные с гарантией
  warranty_unit: ProductBaseUnit; ////параметры, связанные с гарантией
  warranty_comment: string; ////параметры, связанные с гарантией
  doc_number: string; //номер документа на товар
  code_tnved: string; //код ТН ВЭД
  minimal_age: number; //параметры минимального возраста использования
  minimal_age_unit: ProductBaseUnit; //параметры минимального возраста использования
  Distributor: any;
}

export enum ProductStatus {
  NEW = "new",
  MODERATION = "moderation",
  ACTIVE = "active",
  REJECTED = "rejected",
  BLOCKED = "blocked",
  DELETED = "deleted",
  SUSPENDED = "suspended",
}

export const productStatusToStr = (status: ProductStatus) => {
  switch (status) {
    case ProductStatus.NEW:
      return "Новый";

    case ProductStatus.MODERATION:
      return "На модерации";

    case ProductStatus.ACTIVE:
      return "Активен";

    case ProductStatus.REJECTED:
      return "Отклонён";

    case ProductStatus.BLOCKED:
      return "Заблокирован";

    case ProductStatus.DELETED:
      return "Удален";

    default:
      return "Неизвестно";
  }
};

export enum ProductVersionEnum {
  DRAFT = "draft",
  MODERATION = "moderation",
  REJECTED = "rejected",
  ACTIVE = "active",
}

export enum ProductVersionsRussian {
  DRAFT = "Черновик",
  MODERATION = "На модерации",
  ACTIVE = "Активная",
  REJECTED = "Отклоненая",
}
