import type { ReactNode } from "react"

interface BodyProps {
  children?: ReactNode
  layout?: "block" | "flex" | "grid" | "absolute"
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
  borderColor = "#CBD5E0",
  borderStyle = "solid",
  borderOpacity = 1,
}: BodyProps) => {
  const hasBorder =
    borderTopWidth > 0 ||
    borderRightWidth > 0 ||
    borderBottomWidth > 0 ||
    borderLeftWidth > 0

  return (
    <div
      style={{
        width: "100%",
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
        borderTopWidth: hasBorder ? borderTopWidth : 0,
        borderRightWidth: hasBorder ? borderRightWidth : 0,
        borderBottomWidth: hasBorder ? borderBottomWidth : 0,
        borderLeftWidth: hasBorder ? borderLeftWidth : 0,
        borderColor: hasBorder ? borderColor : "transparent",
        borderStyle: hasBorder ? borderStyle : "none",
        opacity: borderOpacity,
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  )
}
