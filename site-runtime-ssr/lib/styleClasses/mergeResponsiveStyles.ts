import { ResponsiveBranch, type ResponsiveStyle } from "../responsiveCss"

type StyleRecord = Record<string, unknown>
/**
 * Склеивает несколько ResponsiveStyle послойно (intrinsic, class, local).
 *  TODO intrinsic - это инититовые стили, убрать после того как инит стили будут попадать в крафт элемент в конструкторе
 */
export const mergeResponsiveStyles = (
  ...layers: (ResponsiveStyle | undefined)[]
): ResponsiveStyle => {
  const merged: ResponsiveStyle = {}
  for (const layer of layers) {
    if (!layer) continue
    for (const branch of Object.values(ResponsiveBranch)) {
      const branchStyle = layer[branch]
      if (!branchStyle || typeof branchStyle !== "object") continue
      merged[branch] = {
        ...(merged[branch] ?? {}),
        ...(branchStyle as StyleRecord),
      }
    }
  }
  return merged
}
