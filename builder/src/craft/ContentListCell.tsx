import { useNode } from "@craftjs/core"
import type { ReactNode } from "react"
import { COLORS } from "../theme/colors"
import { ContentListCellContext } from "../pages/builder/context/ContentListCellContext.tsx"

export type ContentListCellProps = {
  children?: ReactNode
}

/**
 * Одна ячейка списка коллекции. Canvas: в неё можно перетащить элементы (Text и т.д.).
 * Шаблон из первой ячейки синхронизируется во все ячейки в ContentList.
 */
export const ContentListCell = ({ children }: ContentListCellProps) => {
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
        display: "flex",
        alignItems: "flex-start",
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
  props: {},
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}
