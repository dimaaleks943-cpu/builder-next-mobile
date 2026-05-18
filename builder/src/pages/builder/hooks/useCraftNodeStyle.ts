import { useMemo } from "react"
import { usePreviewViewport } from "../context/PreviewViewportContext.tsx"
import { useStyleClassContext } from "../context/StyleClassContext.tsx"
import { pickNodeResponsiveStyle } from "../styleClasses/pickNodeResponsiveStyle.ts"
import { resolveResponsiveStyle, type ResponsiveStyle } from "../responsiveStyle.ts"

/** Резолвит стили узла для текущего viewport. Без склейки — только `props.style` или класс. */
export const useCraftNodeStyle = (
  styleClassId?: string | null,
  localStyle?: ResponsiveStyle,
) => {
  const viewport = usePreviewViewport()
  const { classes } = useStyleClassContext()

  return useMemo(() => {
    const nodeStyle = pickNodeResponsiveStyle(styleClassId, localStyle, classes)
    return resolveResponsiveStyle(nodeStyle, viewport)
  }, [styleClassId, localStyle, classes, viewport])
}
