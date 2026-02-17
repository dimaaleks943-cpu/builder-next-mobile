import type { ReactNode } from "react"

interface BlockProps {
  children?: ReactNode
  layout?: "block" | "flex" | "grid" | "absolute"
  flexDirection?: "row" | "column"
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
  backgroundColor?: string
}

export const Block = ({
  children,
  layout = "block",
  flexDirection,
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
  backgroundColor = "#FFFFFF",
}: BlockProps) => {
  const hasBorder =
    borderTopWidth > 0 ||
    borderRightWidth > 0 ||
    borderBottomWidth > 0 ||
    borderLeftWidth > 0

  const displayStyle =
    layout === "flex"
      ? "flex"
      : layout === "grid"
      ? "grid"
      : "block"

  return (
    <div
      style={{
        display: displayStyle,
        flexDirection: flexDirection,
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
        borderTopWidth: hasBorder ? borderTopWidth : 0,
        borderRightWidth: hasBorder ? borderRightWidth : 0,
        borderBottomWidth: hasBorder ? borderBottomWidth : 0,
        borderLeftWidth: hasBorder ? borderLeftWidth : 0,
        borderColor: hasBorder ? borderColor : "transparent",
        borderStyle: hasBorder ? borderStyle : "none",
        backgroundColor,
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  )
}
