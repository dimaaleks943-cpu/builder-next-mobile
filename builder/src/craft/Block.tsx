import { useNode } from "@craftjs/core"
import { useRef } from "react"
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
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import {
  DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  resolveCraftVisualEffectsStyle,
  type CraftVisualEffectsProps,
} from "./craftVisualEffects.ts"
import { usePreviewViewport } from "../pages/builder/context/PreviewViewportContext.tsx"
import { resolveResponsiveStyle, type ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"

export type BlockProps = {
  children?: ReactNode;
  fullSize?: boolean;
  /**
   * CSS width / height passed to the DOM. Use strings such as `"120px"`, `"50%"`, `"10em"`, or `"auto"`.
   * A bare `number` is still supported as legacy px. In RN builder mode, px is stored as a number; `%` and `auto` stay strings (see `craftCssSizeProp`).
   */
  width?: string | number;
  height?: string | number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  overflow?: "auto" | "hidden" | "visible" | "scroll";
  layout?: BlockLayoutMode;
  gridColumns?: number;
  gridRows?: number;
  gridAutoFlow?: GridAutoFlow;
  gap?: number;
  flexFlow?: FlexFlowOption;
  flexJustifyContent?: FlexJustifyContent;
  flexAlignItems?: FlexAlignItems;
  placeItemsY?: PlaceItemsValue;
  placeItemsX?: PlaceItemsValue;
  // margins
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  // paddings
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  // borders
  borderRadius?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderColor?: string;
  borderStyle?: "none" | "solid" | "dotted";
  /** 0–1, применяется к цвету бордера */
  borderOpacity?: number;
  backgroundColor?: string;
  /** Зарезервировано под будущий UI; в рендере пока не используется */
  backgroundClip?: string;
  style?: ResponsiveStyle;
} & CraftVisualEffectsProps

export const CraftBlock = (props: BlockProps) => {
  const viewport = usePreviewViewport()
  const responsiveStyle = resolveResponsiveStyle(props.style, viewport)
  const fullSize = (responsiveStyle.fullSize as boolean | undefined) ?? props.fullSize
  const width = (responsiveStyle.width as string | number | undefined) ?? props.width
  const height = (responsiveStyle.height as string | number | undefined) ?? props.height
  const minWidth = (responsiveStyle.minWidth as number | undefined) ?? props.minWidth
  const minHeight = (responsiveStyle.minHeight as number | undefined) ?? props.minHeight
  const maxWidth = (responsiveStyle.maxWidth as string | number | undefined) ?? props.maxWidth
  const maxHeight = (responsiveStyle.maxHeight as string | number | undefined) ?? props.maxHeight
  const overflow = (responsiveStyle.overflow as BlockProps["overflow"] | undefined) ?? props.overflow
  const layout = (responsiveStyle.layout as BlockLayoutMode | undefined) ?? props.layout ?? "block"
  const gridColumns = (responsiveStyle.gridColumns as number | undefined) ?? props.gridColumns
  const gridRows = (responsiveStyle.gridRows as number | undefined) ?? props.gridRows
  const gridAutoFlow = (responsiveStyle.gridAutoFlow as GridAutoFlow | undefined) ?? props.gridAutoFlow ?? "row"
  const gap = (responsiveStyle.gap as number | undefined) ?? props.gap
  const flexFlow = (responsiveStyle.flexFlow as FlexFlowOption | undefined) ?? props.flexFlow ?? "row"
  const flexJustifyContent = (responsiveStyle.flexJustifyContent as FlexJustifyContent | undefined) ?? props.flexJustifyContent
  const flexAlignItems = (responsiveStyle.flexAlignItems as FlexAlignItems | undefined) ?? props.flexAlignItems
  const placeItemsY = (responsiveStyle.placeItemsY as PlaceItemsValue | undefined) ?? props.placeItemsY
  const placeItemsX = (responsiveStyle.placeItemsX as PlaceItemsValue | undefined) ?? props.placeItemsX
  const marginTop = (responsiveStyle.marginTop as number | undefined) ?? props.marginTop ?? 0
  const marginRight = (responsiveStyle.marginRight as number | undefined) ?? props.marginRight ?? 0
  const marginBottom = (responsiveStyle.marginBottom as number | undefined) ?? props.marginBottom ?? 0
  const marginLeft = (responsiveStyle.marginLeft as number | undefined) ?? props.marginLeft ?? 0
  const paddingTop = (responsiveStyle.paddingTop as number | undefined) ?? props.paddingTop ?? 0
  const paddingRight = (responsiveStyle.paddingRight as number | undefined) ?? props.paddingRight ?? 0
  const paddingBottom = (responsiveStyle.paddingBottom as number | undefined) ?? props.paddingBottom ?? 0
  const paddingLeft = (responsiveStyle.paddingLeft as number | undefined) ?? props.paddingLeft ?? 0
  const borderRadius = (responsiveStyle.borderRadius as number | undefined) ?? props.borderRadius ?? 0
  const borderTopWidth = (responsiveStyle.borderTopWidth as number | undefined) ?? props.borderTopWidth ?? 0
  const borderRightWidth = (responsiveStyle.borderRightWidth as number | undefined) ?? props.borderRightWidth ?? 0
  const borderBottomWidth = (responsiveStyle.borderBottomWidth as number | undefined) ?? props.borderBottomWidth ?? 0
  const borderLeftWidth = (responsiveStyle.borderLeftWidth as number | undefined) ?? props.borderLeftWidth ?? 0
  const borderColor = (responsiveStyle.borderColor as string | undefined) ?? props.borderColor ?? COLORS.gray400
  const borderStyle = (responsiveStyle.borderStyle as "none" | "solid" | "dotted" | undefined) ?? props.borderStyle ?? "solid"
  const borderOpacity = (responsiveStyle.borderOpacity as number | undefined) ?? props.borderOpacity ?? 1
  const backgroundColor = (responsiveStyle.backgroundColor as string | undefined) ?? props.backgroundColor
  const mixBlendMode = (responsiveStyle.mixBlendMode as string | undefined) ?? props.mixBlendMode ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.mixBlendMode
  const opacityPercent = (responsiveStyle.opacityPercent as number | undefined) ?? props.opacityPercent ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.opacityPercent
  const outlineStyleMode = (responsiveStyle.outlineStyleMode as any) ?? props.outlineStyleMode ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineStyleMode
  const outlineWidth = (responsiveStyle.outlineWidth as number | undefined) ?? props.outlineWidth ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineWidth
  const outlineOffset = (responsiveStyle.outlineOffset as number | undefined) ?? props.outlineOffset ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineOffset
  const outlineColor = (responsiveStyle.outlineColor as string | undefined) ?? props.outlineColor ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineColor
  const blockRef = useRef<HTMLDivElement | null>(null)
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
        blockRef.current = ref
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
        // `width` / `height`: React accepts unit strings and numeric px; matches `formatSizeProp` / craft JSON.
        width: fullSize ? "100%" : width,
        height: fullSize ? "100%" : height,
        minWidth,
        minHeight: fullSize ? undefined : (minHeight ?? 80),
        maxWidth,
        maxHeight,
        overflow,
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
        backgroundColor: backgroundColor ?? COLORS.white,
        boxShadow: fullSize ? "none" : "0 1px 2px rgba(15, 23, 42, 0.08)",
        boxSizing: "border-box",
        // alignItems в конце, чтобы не перезаписаться при мерже/каскаде стилей.
        alignItems: layout === "flex" ? flexAlignItems : undefined,
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
      {selected && (
        <InlineSettingsBadge
          label="Div блок"
          icon={<span style={{ fontSize: 11 }}>B</span>}
          showSettingsButton={false}
          anchorElement={blockRef.current}
          usePortal
        />
      )}
      {props.children}
    </div>
  )
};

(CraftBlock as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.Block,
  props: {
    fullSize: false,
    width: undefined,
    height: undefined,
    minWidth: undefined,
    minHeight: undefined,
    maxWidth: undefined,
    maxHeight: undefined,
    overflow: undefined,
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
    backgroundColor: undefined,
    backgroundClip: undefined,
    ...DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}

