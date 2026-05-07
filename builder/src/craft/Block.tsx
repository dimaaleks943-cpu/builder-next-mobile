import { useNode } from "@craftjs/core"
import type { ReactNode } from "react"
import type {
  BlockLayoutMode,
  FlexAlignItems,
  FlexJustifyContent,
  PlaceItemsValue,
} from "../builder.enum"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
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
  const {
    connectors: { connect, drag },
  } = useNode((node) => ({
    id: node.id,
  }))

  return (
    <div
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      style={{
        ...responsiveStyle,
        minHeight: fullSize ? undefined : (minHeight ?? 80),//TODO дефолтное значение что бы видеть блок при установки

        /** display и layout из «Расположение»; CSS position/float/clear — из «Позиционирование» (responsiveStyle). */
        display: layout === "flex" ? "flex" : layout === "grid" ? "grid" : "block",
        alignItems: layout === "flex" ? flexAlignItems : undefined,
        justifyContent: layout === "flex" ? flexJustifyContent : undefined,
        boxSizing: "border-box",
        placeItems:
          layout === "grid" && placeItemsY != null && placeItemsX != null
            ? `${placeItemsY} ${placeItemsX}`
            : undefined,
      }}
    >
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
      },
    },
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}

