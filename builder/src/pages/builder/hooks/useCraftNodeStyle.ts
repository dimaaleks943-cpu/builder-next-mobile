import { useMemo } from "react"
import { useNode } from "@craftjs/core"
import type { IContentItem } from "../../../api/extranet.ts"
import {
  evaluateConditionalVisibility,
  resolveConditionalVisibilitySourceValue,
} from "../utils/conditionalVisibility"
import { useBuilderModeContext } from "../context/BuilderModeContext.tsx"
import { useBuilderTemplatePage } from "../context/BuilderTemplatePageContext.tsx"
import { useContentListData } from "../context/ContentListDataContext.tsx"
import { usePreviewViewport } from "../context/PreviewViewportContext.tsx"
import { useStyleClassContext } from "../context/StyleClassContext.tsx"
import { resolveResponsiveStyle, type ResponsiveStyle } from "../responsiveStyle.ts"
import { pickNodeResponsiveStyle } from "../styleClasses/pickNodeResponsiveStyle.ts"
import { resolveDesignVariableRefs } from "../variables/resolveDesignVariableRefs.ts"

/** Резолвит стили узла для текущего viewport (стек классов + combo). */
export const useCraftNodeStyle = (
  styleClassIds?: string[] | null,
  localStyle?: ResponsiveStyle,
) => {
  const viewport = usePreviewViewport()
  const { classes } = useStyleClassContext()
  const modeContext = useBuilderModeContext()
  const contentListData = useContentListData()
  const { templatePreviewItem } = useBuilderTemplatePage()
  const { selected, nodeProps } = useNode((node) => ({
    selected: node.events.selected,
    nodeProps: (node.data.props as Record<string, unknown>) ?? {},
  }))

  return useMemo(() => {
    const nodeStyle = pickNodeResponsiveStyle(styleClassIds ?? [], localStyle, classes)
    const resolved = resolveDesignVariableRefs(resolveResponsiveStyle(nodeStyle, viewport))

    const visibilityResult = evaluateConditionalVisibility({
      rawConfig: nodeProps.conditionalVisibility,
      context: {
        resolveSourceValue: (source) =>
          resolveConditionalVisibilitySourceValue(source, {
            collectionItem:
              ((contentListData?.itemData ?? templatePreviewItem) as IContentItem | null | undefined) ?? null,
            locale: modeContext?.activeLocale ?? null,
            componentProps: nodeProps,
          }),
      },
    })

    if (!visibilityResult.isVisible && !selected) {
      return {
        ...resolved,
        display: "none",
      }
    }

    return resolved
  }, [
    styleClassIds,
    localStyle,
    classes,
    viewport,
    nodeProps,
    contentListData?.itemData,
    templatePreviewItem,
    modeContext?.activeLocale,
    selected,
  ])
}
