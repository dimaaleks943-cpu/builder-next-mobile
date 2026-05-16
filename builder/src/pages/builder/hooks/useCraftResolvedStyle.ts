import { useMemo } from "react"
import { usePreviewViewport } from "../context/PreviewViewportContext.tsx"
import { useStyleClassContext } from "../context/StyleClassContext.tsx"
import {
  mergeResponsiveStyles,
  resolveResponsiveStyle,
  type ResponsiveStyle,
} from "../responsiveStyle.ts"
import { getCraftIntrinsicStyle } from "../styleClasses/craftIntrinsicStyles.ts"

export const useCraftResolvedStyle = (
  resolvedName: string,
  styleClassId?: string | null,
  localStyle?: ResponsiveStyle,
) => {
  const viewport = usePreviewViewport()
  const { classes } = useStyleClassContext()

  return useMemo(() => {
    const intrinsic = getCraftIntrinsicStyle(resolvedName)
    const classStyle = styleClassId ? classes[styleClassId]?.style : undefined
    return resolveResponsiveStyle(
      mergeResponsiveStyles(intrinsic, classStyle, localStyle),
      viewport,
    )
  }, [resolvedName, styleClassId, localStyle, classes, viewport])
}
