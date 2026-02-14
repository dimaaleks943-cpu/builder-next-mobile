import { useNode } from "@craftjs/core"
import type { ReactNode } from "react"
import { COLORS } from "../theme/colors"
import { withOpacity } from "../utils/colorUtils"

export type BodyLayoutMode = "block" | "flex" | "grid" | "absolute"

export type BodyProps = {
  children?: ReactNode
  layout?: BodyLayoutMode
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  borderRadius?: number
  borderTopWidth?: number
  borderRightWidth?: number
  borderBottomWidth?: number
  borderLeftWidth?: number
  borderColor?: string
  borderStyle?: "none" | "solid" | "dashed"
  borderOpacity?: number
}

// Root component используется только как стартовый элемент холста, не удаляется
export const Body = ({
  children,
  layout = "block",
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
}: BodyProps) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
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
        width: "100%",
        height: "100%",
        minHeight: 80,
        display:
          layout === "flex" ? "flex" : layout === "grid" ? "grid" : "block",
        position: layout === "absolute" ? "absolute" : "relative",
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        borderRadius,
        borderStyle: selected ? "solid" : hasCustomBorder ? (borderStyle || "solid") : "solid",
        borderColor: selected ? COLORS.purple400 : effectiveBorderColor,
        borderTopWidth: selected ? 2 : hasCustomBorder ? borderTopWidth : 0,
        borderRightWidth: selected ? 2 : hasCustomBorder ? borderRightWidth : 0,
        borderBottomWidth: selected ? 2 : hasCustomBorder ? borderBottomWidth : 0,
        borderLeftWidth: selected ? 2 : hasCustomBorder ? borderLeftWidth : 0,
        backgroundColor: COLORS.white,
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  )
}

;(Body as any).craft = {
  displayName: "Body",
  props: {
    layout: "block" as BodyLayoutMode,
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
