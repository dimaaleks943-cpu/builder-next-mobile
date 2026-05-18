import type { ResponsiveStyle } from "../responsiveStyle.ts"
import type { StyleClassesRegistry } from "./types.ts"

/** Один источник стилей узла: класс или локальный `props.style`, без склейки слоёв. */
export const pickNodeResponsiveStyle = (
  styleClassId: string | null | undefined,
  localStyle: ResponsiveStyle | undefined,
  classes: StyleClassesRegistry,
): ResponsiveStyle | undefined => {
  if (styleClassId) {
    return classes[styleClassId]?.style
  }
  return localStyle
}
