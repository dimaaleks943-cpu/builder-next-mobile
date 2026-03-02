import { useNode } from "@craftjs/core"
import type { ReactNode } from "react"
import { COLORS } from "../theme/colors"
import { ContentListCellContext } from "../pages/builder/context/ContentListCellContext.tsx"
import type { BlockLayoutMode } from "./Block"

export type ContentListCellProps = {
  children?: ReactNode
  layout?: BlockLayoutMode
  gridColumns?: number
  gridRows?: number
}

/**
 * Одна ячейка списка коллекции. Canvas: в неё можно перетащить элементы (Text и т.д.).
 * Шаблон из первой ячейки синхронизируется во все ячейки в ContentList.
 *
 * layout / gridColumns / gridRows управляются через LayoutAccordion и
 * описывают, как раскладывать дочерние элементы внутри ячейки.
 */
export const ContentListCell = ({
  children,
  layout = "block",
  gridColumns,
  gridRows,
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

;(ContentListCell as any).craft = {
  displayName: "ContentListCell",
  props: {
    layout: "block" as BlockLayoutMode,
    gridColumns: undefined,
    gridRows: undefined,
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}
