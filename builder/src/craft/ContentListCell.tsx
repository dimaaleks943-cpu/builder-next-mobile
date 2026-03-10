import { useNode } from "@craftjs/core"
import type { ReactNode } from "react"
import { COLORS } from "../theme/colors"
import { ContentListCellContext } from "../pages/builder/context/ContentListCellContext.tsx"
import type { BlockLayoutMode, GridAutoFlow, PlaceItemsValue } from "../builder.enum.ts";


export type ContentListCellProps = {
  children?: ReactNode
  layout?: BlockLayoutMode;
  gridColumns?: number
  gridRows?: number
  gridAutoFlow?: GridAutoFlow;
  gap?: number
  placeItemsY?: PlaceItemsValue;
  placeItemsX?: PlaceItemsValue;
}

/**
 * Одна ячейка списка коллекции. Canvas: в неё можно перетащить элементы (Text и т.д.).
 * Шаблон из первой ячейки синхронизируется во все ячейки в ContentList.
 *
 * layout / gridColumns / gridRows управляются через LayoutAccordion и
 * описывают, как раскладывать дочерние элементы внутри ячейки.
 */
export const CraftContentListCell = ({
  children,
  layout = "block",
  gridColumns,
  gridRows,
  gridAutoFlow = "row",
  gap,
  placeItemsY,
  placeItemsX,
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
        minHeight: 48,
        padding: "16px",
        position: "relative" as const,
        display:
          layout === "flex" ? "flex" : layout === "grid" ? "grid" : "block",
        alignItems: "flex-start",
        gridTemplateColumns:
          layout === "grid" && gridColumns && gridColumns > 0
            ? `repeat(${gridColumns}, minmax(0, 1fr))`
            : undefined,
        gridTemplateRows:
          layout === "grid" && gridRows && gridRows > 0
            ? `repeat(${gridRows}, auto)`
            : undefined,
        gridAutoFlow: layout === "grid" ? gridAutoFlow : undefined,
        gap: layout === "grid" && gap != null && gap >= 0 ? gap : undefined,
        placeItems:
          layout === "grid" && placeItemsY != null && placeItemsX != null
            ? `${placeItemsY} ${placeItemsX}`
            : undefined,
        boxSizing: "border-box",
        backgroundColor: selected ? "rgba(108, 93, 211, 0.08)" : "transparent",
        border: selected ? `1px dashed ${COLORS.purple400}` : "none",
        borderRadius: 4,
      }}
    >
      <ContentListCellContext.Provider value={true}>
        {children}
      </ContentListCellContext.Provider>
    </div>
  )
}

;(CraftContentListCell as any).craft = {
  displayName: "ContentListCell",
  props: {
    layout: "block" as BlockLayoutMode,
    gridColumns: undefined,
    gridRows: undefined,
    gridAutoFlow: "row" as const,
    gap: undefined,
    placeItemsY: undefined,
    placeItemsX: undefined,
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}
