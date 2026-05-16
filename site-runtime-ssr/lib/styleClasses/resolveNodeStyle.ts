import type { ResponsiveStyle } from "../responsiveCss"
import { resolveCraftDisplayName } from "./craftDisplayNames"
import { getCraftIntrinsicStyle } from "./craftIntrinsicStyles"
import { mergeResponsiveStyles } from "./mergeResponsiveStyles"
import type { StyleClassesRegistry } from "./types"

const hasStyleBranches = (style: ResponsiveStyle): boolean =>
  Object.values(style).some(
    (branch) =>
      branch &&
      typeof branch === "object" &&
      Object.keys(branch as Record<string, unknown>).length > 0,
  )

/**
 * Собирает итоговый ResponsiveStyle для узла Craft перед рендером:
 * 1) intrinsic по типу/displayName TODO временно
 * 2) стили из styleClasses[styleClassId], если в props есть styleClassId,
 * 3) локальный props.style узла.
 * Возвращает merged-объект или undefined, если стилей по сути нет.
 */
export const resolveSerializedNodeStyle = (
  rawProps: Record<string, unknown>,
  componentType: string,
  nodeDisplayName: string | undefined,
  styleClasses: StyleClassesRegistry,
): ResponsiveStyle | undefined => {
  const displayName = resolveCraftDisplayName(componentType, nodeDisplayName)
  const intrinsic = getCraftIntrinsicStyle(displayName)
  const styleClassId =
    typeof rawProps.styleClassId === "string" ? rawProps.styleClassId : undefined
  const classStyle = styleClassId ? styleClasses[styleClassId]?.style : undefined
  const localStyle =
    rawProps.style && typeof rawProps.style === "object"
      ? (rawProps.style as ResponsiveStyle)
      : undefined

  const merged = mergeResponsiveStyles(intrinsic, classStyle, localStyle)
  return hasStyleBranches(merged) ? merged : undefined
}

export const propsForRuntime = (
  rawProps: Record<string, unknown>,
  componentType: string,
  nodeDisplayName: string | undefined,
  styleClasses: StyleClassesRegistry,
): Record<string, unknown> => {
  const resolvedStyle = resolveSerializedNodeStyle(
    rawProps,
    componentType,
    nodeDisplayName,
    styleClasses,
  )
  const props = { ...rawProps }
  delete props.styleClassId
  if (resolvedStyle) {
    props.style = resolvedStyle
  } else {
    delete props.style
  }
  return props
}
