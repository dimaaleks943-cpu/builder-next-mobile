import { useMemo } from "react"
import { usePreviewViewport } from "../context/PreviewViewportContext.tsx"
import { useStyleClassContext } from "../context/StyleClassContext.tsx"
import { pickNodeResponsiveStyle } from "../styleClasses/pickNodeResponsiveStyle.ts"
import { resolveDesignVariableRefs } from "../variables/resolveDesignVariableRefs.ts"
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
    const resolved = resolveResponsiveStyle(nodeStyle, viewport)

    return resolveDesignVariableRefs(resolved)
  }, [styleClassIds, localStyle, classes, viewport])
}
