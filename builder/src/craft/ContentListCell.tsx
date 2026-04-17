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
  DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  resolveCraftVisualEffectsStyle,
  type CraftVisualEffectsProps,
} from "./craftVisualEffects.ts"

export type ContentListCellProps = {
  children?: ReactNode
  width?: string | number
  height?: string | number
  minWidth?: number
  minHeight?: number
  maxWidth?: string | number
  maxHeight?: string | number
  overflow?: "auto" | "hidden" | "visible" | "scroll"
  layout?: BlockLayoutMode
  gridColumns?: number
  gridRows?: number
  gridAutoFlow?: GridAutoFlow
  gap?: number
  flexFlow?: FlexFlowOption
  flexJustifyContent?: FlexJustifyContent
  flexAlignItems?: FlexAlignItems
  placeItemsY?: PlaceItemsValue
  placeItemsX?: PlaceItemsValue
  backgroundColor?: string
  /** Зарезервировано под будущий UI; в рендере пока не используется */
  backgroundClip?: string
} & CraftVisualEffectsProps

/**
 * Одна ячейка списка коллекции. Canvas: в неё можно перетащить элементы (Text и т.д.).
 * Любая ячейка может быть источником правды: ContentList синхронизирует изменения во все ячейки.
 *
 * layout / gridColumns / gridRows управляются через LayoutAccordion и
 * описывают, как раскладывать дочерние элементы внутри ячейки.
 */
export const CraftContentListCell = ({
  children,
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  overflow,
  layout = "block",
  gridColumns,
  gridRows,
  gridAutoFlow = "row",
  gap,
  flexFlow = "row",
  flexJustifyContent,
  flexAlignItems,
  placeItemsY,
  placeItemsX,
  backgroundColor,
  backgroundClip: _backgroundClip,
  mixBlendMode = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.mixBlendMode,
  opacityPercent = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.opacityPercent,
  outlineStyleMode = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineStyleMode,
  outlineWidth = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineWidth,
  outlineOffset = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineOffset,
  outlineColor = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineColor,
}: ContentListCellProps) => {
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
        {children}
      </ContentListCellContext.Provider>
    </div>
  )
}

;(CraftContentListCell as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.ContentListCell,
  props: {
    layout: "block" as BlockLayoutMode,
    width: undefined,
    height: undefined,
    minWidth: undefined,
    minHeight: undefined,
    maxWidth: undefined,
    maxHeight: undefined,
    overflow: undefined,
    gridColumns: undefined,
    gridRows: undefined,
    gridAutoFlow: "row" as const,
    gap: undefined,
    flexFlow: "row" as const,
    flexJustifyContent: undefined,
    flexAlignItems: undefined,
    placeItemsY: undefined,
    placeItemsX: undefined,
    backgroundColor: undefined,
    backgroundClip: undefined,
    ...DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}
