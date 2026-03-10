import { useNode } from "@craftjs/core"
import type { ReactNode } from "react"
import { COLORS } from "../theme/colors"
import { withOpacity } from "../utils/colorUtils"
import { InlineSettingsBadge } from "../components/InlineSettingsBadge.tsx"
import type {
  BlockLayoutMode,
  FlexAlignItems,
  FlexFlowOption,
  FlexJustifyContent,
  GridAutoFlow,
  PlaceItemsValue,
} from "../builder.enum"

export type BlockProps = {
  children?: ReactNode
  fullSize?: boolean
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
  // margins
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  // paddings
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  // borders
  borderRadius?: number
  borderTopWidth?: number
  borderRightWidth?: number
  borderBottomWidth?: number
  borderLeftWidth?: number
  borderColor?: string
  borderStyle?: "none" | "solid" | "dashed"
  /** 0–1, применяется к цвету бордера */
  borderOpacity?: number
}

export const CraftBlock = ({
  children,
  fullSize,
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
  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  marginLeft = 0,
  paddingTop = 0,
  paddingRight = 0,
  paddingBottom = 0,
  paddingLeft = 0,
  borderRadius = 0,
  borderTopWidth = 0,
  borderRightWidth = 0,
  borderBottomWidth = 0,
  borderLeftWidth = 0,
  borderColor = COLORS.gray400,
  borderStyle = "solid",
  borderOpacity = 1,
}: BlockProps) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
    id: node.id,
  }))

  const hasCustomBorder =
    borderTopWidth > 0 ||
    borderRightWidth > 0 ||
    borderBottomWidth > 0 ||
    borderLeftWidth > 0

  const effectiveBorderColor = hasCustomBorder
    ? withOpacity(borderColor, borderOpacity)
    : "transparent"

  return (
    <div
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      style={{
        /** display и position — разные CSS‑свойства, но в LayoutAccordion задаём одним блоком «Расположение».
         * Сейчас: layout="absolute" → position:absolute, display:block; остальные → display напрямую.
         * TODO: продумать, как лучше разделить или оформить настройки display vs position. */
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
        justifyContent:
          layout === "flex" ? flexJustifyContent : undefined,
        alignItems: layout === "flex" ? flexAlignItems : undefined,
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
        position: layout === "absolute" ? "absolute" : "relative",
        width: fullSize ? "100%" : undefined,
        height: fullSize ? "100%" : undefined,
        minHeight: fullSize ? undefined : 80,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        borderRadius: fullSize ? 0 : borderRadius,
        borderStyle: selected ? "solid" : hasCustomBorder ? (borderStyle || "solid") : "solid",
        borderColor: selected ? COLORS.purple400 : effectiveBorderColor,
        borderTopWidth: selected ? 2 : hasCustomBorder ? borderTopWidth : 0,
        borderRightWidth: selected ? 2 : hasCustomBorder ? borderRightWidth : 0,
        borderBottomWidth: selected ? 2 : hasCustomBorder ? borderBottomWidth : 0,
        borderLeftWidth: selected ? 2 : hasCustomBorder ? borderLeftWidth : 0,
        backgroundColor: COLORS.white,
        boxShadow: fullSize ? "none" : "0 1px 2px rgba(15, 23, 42, 0.08)",
        boxSizing: "border-box",
      }}
    >
      {selected && (
        <InlineSettingsBadge
          label="Block"
          icon={<span style={{ fontSize: 11 }}>B</span>}
          showSettingsButton={false}
        />
      )}
      {children}
    </div>
  )
}

;(CraftBlock as any).craft = {
  displayName: "Block",
  props: {
    fullSize: false,
    layout: "block" as BlockLayoutMode,
    gridColumns: undefined,
    gridRows: undefined,
    gridAutoFlow: "row" as const,
    gap: undefined,
    flexFlow: "row" as const,
    flexJustifyContent: undefined,
    flexAlignItems: undefined,
    placeItemsY: undefined,
    placeItemsX: undefined,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    borderRadius: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderColor: COLORS.gray400,
    borderStyle: "solid" as const,
    borderOpacity: 1,
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}

