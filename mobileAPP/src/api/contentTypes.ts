export interface IContentTypeField {
  id: string;
  name: string;
  field_type?: string;
  reference_type?: string;
  [key: string]: unknown;
}

export interface ContentType {
  id: string;
  name: string;
  fields?: IContentTypeField[];
  [key: string]: unknown;
}

export interface IContentItemField {
  id: string;
  field_type?: string;
  name?: string;
  value?: unknown;
  value_text?: string | null;
  value_float?: number | null;
  value_boolean?: boolean | null;
  [key: string]: unknown;
}

export interface IContentItem {
  id: string;
  content_type_id?: string;
  fields?: IContentItemField[];
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: unknown | null;
}
