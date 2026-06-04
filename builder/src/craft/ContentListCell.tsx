import { useNode } from "@craftjs/core"
import type { CSSProperties, ReactNode } from "react"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"
import { useCraftNodeStyle } from "../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"

export type ContentListCellProps = {
  children?: ReactNode
  styleClassIds?: string[]
  style?: ResponsiveStyle
}

/**
 * Одна ячейка списка коллекции. Canvas: в неё можно перетащить элементы (Heading и т.д.).
 * Любая ячейка может быть источником правды: ContentList синхронизирует изменения во все ячейки.
 *
 * display, flexFlow, justifyContent, alignItems, gridTemplate*, placeItems, gap — в `responsiveStyle` в виде имён React/CSS.
 */
export const CraftContentListCell = (props: ContentListCellProps) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
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
        ...(responsiveStyle as CSSProperties),
        flex: 1,
        padding: "16px",
      }}
    >
      {props.children}
    </div>
  )
};

(CraftContentListCell as any).craft = {
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
