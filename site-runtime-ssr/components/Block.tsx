import type { ReactNode } from "react"
import { withOpacity } from "@/lib/colorUtils"

interface BlockProps {
  children?: ReactNode
  fullSize?: boolean
  layout?: "block" | "flex" | "grid" | "absolute"
  gridColumns?: number
  gridRows?: number
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

export const Block = ({
  children,
  fullSize = false,
  layout = "block",
  gridColumns,
  gridRows,
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
  borderColor = "#CBD5E0",
  borderStyle = "solid",
  borderOpacity = 1,
}: BlockProps) => {
  const hasCustomBorder =
    borderTopWidth > 0 ||
    borderRightWidth > 0 ||
    borderBottomWidth > 0 ||
    borderLeftWidth > 0

  const effectiveBorderColor = hasCustomBorder
    ? withOpacity(borderColor ?? "#CBD5E0", borderOpacity ?? 1)
    : "transparent"

  return (
    <div
      style={{
        display:
          layout === "flex" ? "flex" : layout === "grid" ? "grid" : "block",
        gridTemplateColumns:
          layout === "grid" && gridColumns && gridColumns > 0
            ? `repeat(${gridColumns}, minmax(0, 1fr))`
            : undefined,
        gridTemplateRows:
          layout === "grid" && gridRows && gridRows > 0
            ? `repeat(${gridRows}, auto)`
            : undefined,
        position: layout === "absolute" ? "absolute" : "relative",
        width: fullSize ? "100%" : undefined,
        height: fullSize ? "100%" : undefined,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        borderRadius: fullSize ? 0 : borderRadius,
        borderTopWidth: hasCustomBorder ? borderTopWidth : 0,
        borderRightWidth: hasCustomBorder ? borderRightWidth : 0,
        borderBottomWidth: hasCustomBorder ? borderBottomWidth : 0,
        borderLeftWidth: hasCustomBorder ? borderLeftWidth : 0,
        borderColor: effectiveBorderColor,
        borderStyle: hasCustomBorder ? (borderStyle || "solid") : "solid",
        backgroundColor: "#FFFFFF",
        boxShadow: fullSize ? "none" : "0 1px 2px rgba(15, 23, 42, 0.08)",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  )
}
