import { useNode } from "@craftjs/core"
import type { ReactNode } from "react"
import { ContentListCellContext } from "../pages/builder/context/ContentListCellContext.tsx"
import type { PlaceItemsValue } from "../builder.enum"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
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
 * display / gridColumns / gridRows управляются через LayoutAccordion и
 * описывают, как раскладывать дочерние элементы внутри ячейки.
 */
export const CraftContentListCell = (props: ContentListCellProps) => {
  const viewport = usePreviewViewport()
  const responsiveStyle = resolveResponsiveStyle(props.style, viewport)
  const display = (responsiveStyle.display as string | undefined) ?? "block"
  const isGridLayout = display === "grid" || display === "inline-grid"
  const placeItemsY = responsiveStyle.placeItemsY as PlaceItemsValue | undefined
  const placeItemsX = responsiveStyle.placeItemsX as PlaceItemsValue | undefined
  const {
    connectors: { connect, drag },
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
        padding: "16px",
        placeItems:
          isGridLayout && placeItemsY != null && placeItemsX != null
            ? `${placeItemsY} ${placeItemsX}`
            : undefined,
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
        display: "block",
        padding: "16px",
        gridAutoFlow: "row" as const,
        flexFlow: "row" as const,
      },
    },
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}
