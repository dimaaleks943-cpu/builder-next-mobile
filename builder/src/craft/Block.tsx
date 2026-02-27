import { useNode } from "@craftjs/core"
import type { ReactNode } from "react"
import { COLORS } from "../theme/colors"
import { withOpacity } from "../utils/colorUtils"
import { InlineSettingsBadge } from "../components/InlineSettingsBadge.tsx"

export type BlockLayoutMode = "block" | "flex" | "grid" | "absolute"

export type BlockProps = {
  children?: ReactNode
  fullSize?: boolean
  layout?: BlockLayoutMode
  // margins
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  // paddings
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  // borders
  borderRadius?: number
  borderTopWidth?: number
  borderRightWidth?: number
  borderBottomWidth?: number
  borderLeftWidth?: number
  borderColor?: string
  borderStyle?: "none" | "solid" | "dashed"
  /** 0–1, применяется к цвету бордера */
  borderOpacity?: number
}

export const Block = ({
  children,
  fullSize,
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
}: BlockProps) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
    id: node.id,
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
        display:
          layout === "flex" ? "flex" : layout === "grid" ? "grid" : "block",
        position: layout === "absolute" ? "absolute" : "relative",
        width: fullSize ? "100%" : undefined,
        height: fullSize ? "100%" : undefined,
        minHeight: fullSize ? undefined : 80,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        borderRadius: fullSize ? 0 : borderRadius,
        borderStyle: selected ? "solid" : hasCustomBorder ? (borderStyle || "solid") : "solid",
        borderColor: selected ? COLORS.purple400 : effectiveBorderColor,
        borderTopWidth: selected ? 2 : hasCustomBorder ? borderTopWidth : 0,
        borderRightWidth: selected ? 2 : hasCustomBorder ? borderRightWidth : 0,
        borderBottomWidth: selected ? 2 : hasCustomBorder ? borderBottomWidth : 0,
        borderLeftWidth: selected ? 2 : hasCustomBorder ? borderLeftWidth : 0,
        backgroundColor: COLORS.white,
        boxShadow: fullSize ? "none" : "0 1px 2px rgba(15, 23, 42, 0.08)",
        boxSizing: "border-box",
      }}
    >
      {selected && (
        <InlineSettingsBadge
          label="Block"
          icon={<span style={{ fontSize: 11 }}>B</span>}
          showSettingsButton={false}
        />
      )}
      {children}
    </div>
  )
}

;(Block as any).craft = {
  displayName: "Block",
  props: {
    fullSize: false,
    layout: "block" as BlockLayoutMode,
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

