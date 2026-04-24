import { useNode } from "@craftjs/core"
import { useRef } from "react"
import type { ReactNode } from "react"
import { COLORS } from "../theme/colors"
import { withOpacity } from "../utils/colorUtils"
import { InlineSettingsBadge } from "../components/InlineSettingsBadge.tsx"
import type {
  BlockLayoutMode,
  FlexAlignItems,
  FlexJustifyContent,
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

export type BlockProps = {
  children?: ReactNode
  style?: ResponsiveStyle
}

export const CraftBlock = (props: BlockProps) => {
  const viewport = usePreviewViewport()
  const responsiveStyle = resolveResponsiveStyle(props.style, viewport)
  const fullSize = responsiveStyle.fullSize as boolean | undefined
  const minHeight = responsiveStyle.minHeight as number | undefined
  const layout = (responsiveStyle.layout as BlockLayoutMode | undefined) ?? "block"
  const flexJustifyContent = responsiveStyle.flexJustifyContent as FlexJustifyContent | undefined
  const flexAlignItems = responsiveStyle.flexAlignItems as FlexAlignItems | undefined
  const placeItemsY = responsiveStyle.placeItemsY as PlaceItemsValue | undefined
  const placeItemsX = responsiveStyle.placeItemsX as PlaceItemsValue | undefined
  const borderTopWidth = (responsiveStyle.borderTopWidth as number | undefined) ?? 0
  const borderRightWidth = (responsiveStyle.borderRightWidth as number | undefined) ?? 0
  const borderBottomWidth = (responsiveStyle.borderBottomWidth as number | undefined) ?? 0
  const borderLeftWidth = (responsiveStyle.borderLeftWidth as number | undefined) ?? 0
  const borderColor = (responsiveStyle.borderColor as string | undefined) ?? COLORS.gray400
  const borderOpacity = (responsiveStyle.borderOpacity as number | undefined) ?? 1
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
        ...responsiveStyle,
        minHeight: fullSize ? undefined : (minHeight ?? 80),//TODO дефолтное значение что бы видеть блок при установки

        /** подсветка блок TODO вынести как отдельную обвертку */
        borderColor: selected ? COLORS.purple400 : effectiveBorderColor,
        borderTopWidth: selected ? 2 : hasCustomBorder ? borderTopWidth : 0,
        borderRightWidth: selected ? 2 : hasCustomBorder ? borderRightWidth : 0,
        borderBottomWidth: selected ? 2 : hasCustomBorder ? borderBottomWidth : 0,
        borderLeftWidth: selected ? 2 : hasCustomBorder ? borderLeftWidth : 0,

        //position: layout === "absolute" ? "absolute" : "relative", //TODO обновить послео изменения layuotBLock

        /** display и position — разные CSS‑свойства, но в LayoutAccordion задаём одним блоком «Расположение».
         * Сейчас: layout="absolute" → position:absolute, display:block; остальные → display напрямую.
         * TODO: продумать, как лучше разделить или оформить настройки display vs position. */
        display: layout === "flex" ? "flex" : layout === "grid" ? "grid" : "block",
        alignItems: layout === "flex" ? flexAlignItems : undefined,
        justifyContent: layout === "flex" ? flexJustifyContent : undefined,
        boxSizing: "border-box",
        placeItems:
          layout === "grid" && placeItemsY != null && placeItemsX != null
            ? `${placeItemsY} ${placeItemsX}`
            : undefined,
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
    style: {
      [PreviewViewport.DESKTOP]: {
        fullSize: false,
        layout: "block" as BlockLayoutMode,
        gridAutoFlow: "row" as const,
        flexFlow: "row" as const,
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
        ...DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
      },
    },
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}

