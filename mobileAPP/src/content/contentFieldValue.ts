import type { IContentItem, IContentItemField } from "../api/contentTypes";

export function findContentItemField(
  item: IContentItem | null | undefined,
  fieldId: string,
): IContentItemField | undefined {
  if (!item?.fields?.length) return undefined;
  return item.fields.find((field) => field.id === fieldId);
}

export function getContentFieldDisplayValue(
  field: IContentItemField | undefined,
): string {
  if (!field) return "";

  if (field.value_text != null && field.value_text !== "") {
    return String(field.value_text);
  }
  if (field.value_boolean !== null && field.value_boolean !== undefined) {
    return field.value_boolean ? "true" : "false";
  }
  if (
    field.value_float !== null &&
    field.value_float !== undefined &&
    !Number.isNaN(field.value_float)
  ) {
    return String(field.value_float);
  }

  const value = field.value;
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}
