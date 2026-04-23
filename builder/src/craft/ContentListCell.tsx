import { useNode } from "@craftjs/core"
import type { ReactNode } from "react"
import { COLORS } from "../theme/colors"
import { ContentListCellContext } from "../pages/builder/context/ContentListCellContext.tsx"
import type {
  BlockLayoutMode,
  FlexAlignItems,
  FlexFlowOption,
  FlexJustifyContent,
  GridAutoFlow,
  PlaceItemsValue,
} from "../builder.enum"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import {
  type CraftMixBlendMode,
  DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  resolveCraftVisualEffectsStyle,
} from "./craftVisualEffects.ts"
import { usePreviewViewport } from "../pages/builder/context/PreviewViewportContext.tsx"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"
import { resolveResponsiveStyle, type ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"

export type ContentListCellProps = {
  children?: ReactNode
  style?: ResponsiveStyle
}

/**
 * Одна ячейка списка коллекции. Canvas: в неё можно перетащить элементы (Text и т.д.).
 * Любая ячейка может быть источником правды: ContentList синхронизирует изменения во все ячейки.
 *
 * layout / gridColumns / gridRows управляются через LayoutAccordion и
 * описывают, как раскладывать дочерние элементы внутри ячейки.
 */
export const CraftContentListCell = (props: ContentListCellProps) => {
  const viewport = usePreviewViewport()
  const responsiveStyle = resolveResponsiveStyle(props.style, viewport)
  const width = responsiveStyle.width as string | number | undefined
  const height = responsiveStyle.height as string | number | undefined
  const minWidth = responsiveStyle.minWidth as number | undefined
  const minHeight = responsiveStyle.minHeight as number | undefined
  const maxWidth = responsiveStyle.maxWidth as string | number | undefined
  const maxHeight = responsiveStyle.maxHeight as string | number | undefined
  const overflow = responsiveStyle.overflow as "auto" | "hidden" | "visible" | "scroll" | undefined
  const layout = (responsiveStyle.layout as BlockLayoutMode | undefined) ?? "block"
  const gridColumns = responsiveStyle.gridColumns as number | undefined
  const gridRows = responsiveStyle.gridRows as number | undefined
  const gridAutoFlow = (responsiveStyle.gridAutoFlow as GridAutoFlow | undefined) ?? "row"
  const gap = responsiveStyle.gap as number | undefined
  const flexFlow = (responsiveStyle.flexFlow as FlexFlowOption | undefined) ?? "row"
  const flexJustifyContent = responsiveStyle.flexJustifyContent as FlexJustifyContent | undefined
  const flexAlignItems = responsiveStyle.flexAlignItems as FlexAlignItems | undefined
  const placeItemsY = responsiveStyle.placeItemsY as PlaceItemsValue | undefined
  const placeItemsX = responsiveStyle.placeItemsX as PlaceItemsValue | undefined
  const backgroundColor = responsiveStyle.backgroundColor as string | undefined
  const mixBlendMode =
    (responsiveStyle.mixBlendMode as CraftMixBlendMode | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.mixBlendMode
  const opacityPercent =
    (responsiveStyle.opacityPercent as number | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.opacityPercent
  const outlineStyleMode =
    (responsiveStyle.outlineStyleMode as (typeof DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS)["outlineStyleMode"]) ??
    DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineStyleMode
  const outlineWidth =
    (responsiveStyle.outlineWidth as number | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineWidth
  const outlineOffset =
    (responsiveStyle.outlineOffset as number | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineOffset
  const outlineColor =
    (responsiveStyle.outlineColor as string | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineColor
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
  }))

  return (
    <div
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      style={{
        flex: 1,
        width,
        height,
        minWidth,
        minHeight: minHeight ?? 48,
        maxWidth,
        maxHeight,
        overflow,
        padding: "16px",
        position: "relative" as const,
        display:
          layout === "flex" ? "flex" : layout === "grid" ? "grid" : "block",
        flexDirection:
          layout === "flex"
            ? flexFlow === "column"
              ? "column"
              : "row"
            : undefined,
        flexWrap:
          layout === "flex" ? (flexFlow === "wrap" ? "wrap" : "nowrap") : undefined,
        justifyContent: layout === "flex" ? flexJustifyContent : undefined,
        gap:
          (layout === "grid" || layout === "flex") &&
          gap != null &&
          gap >= 0
            ? gap
            : undefined,
        gridTemplateColumns:
          layout === "grid" && gridColumns && gridColumns > 0
            ? `repeat(${gridColumns}, minmax(0, 1fr))`
            : undefined,
        gridTemplateRows:
          layout === "grid" && gridRows && gridRows > 0
            ? `repeat(${gridRows}, auto)`
            : undefined,
        gridAutoFlow: layout === "grid" ? gridAutoFlow : undefined,
        placeItems:
          layout === "grid" && placeItemsY != null && placeItemsX != null
            ? `${placeItemsY} ${placeItemsX}`
            : undefined,
        boxSizing: "border-box",
        backgroundColor: selected
          ? "rgba(108, 93, 211, 0.08)"
          : (backgroundColor ?? "transparent"),
        border: selected ? `1px dashed ${COLORS.purple400}` : "none",
        borderRadius: 4,
        // alignItems в конце объекта, чтобы не перезаписаться другими стилями при мерже/каскаде.
        alignItems:
          layout === "flex" ? (flexAlignItems ?? "flex-start") : "flex-start",
        ...resolveCraftVisualEffectsStyle({
          mixBlendMode,
          opacityPercent,
          outlineStyleMode,
          outlineWidth,
          outlineOffset,
          outlineColor,
        }),
      }}
    >
      <ContentListCellContext.Provider value={true}>
        {props.children}
      </ContentListCellContext.Provider>
    </div>
  )
}

;(CraftContentListCell as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.ContentListCell,
  props: {
    style: {
      [PreviewViewport.DESKTOP]: {
        layout: "block" as BlockLayoutMode,
        gridAutoFlow: "row" as const,
        flexFlow: "row" as const,
        ...DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
      },
    },
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}
