import { useMemo } from "react"
import { usePreviewViewport } from "../context/PreviewViewportContext.tsx"
import { useStyleClassContext } from "../context/StyleClassContext.tsx"
import { pickNodeResponsiveStyle } from "../styleClasses/pickNodeResponsiveStyle.ts"
import { resolveResponsiveStyle, type ResponsiveStyle } from "../responsiveStyle.ts"

/** Резолвит стили узла для текущего viewport (стек классов + combo). */
export const useCraftNodeStyle = (
  styleClassIds?: string[] | null,
  localStyle?: ResponsiveStyle,
) => {
  const viewport = usePreviewViewport()
  const { classes } = useStyleClassContext()

  return useMemo(() => {
    const nodeStyle = pickNodeResponsiveStyle(styleClassIds ?? [], localStyle, classes)
    return resolveResponsiveStyle(nodeStyle, viewport)
  }, [styleClassIds, localStyle, classes, viewport])
}
