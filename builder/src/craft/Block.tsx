import { useNode } from "@craftjs/core"
import type { ReactNode } from "react";
import { COLORS } from "../theme/colors.ts";

type BlockProps = {
  children?: ReactNode
  fullSize?: boolean
}

export const Block = ({ children, fullSize }: BlockProps) => {
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
        width: fullSize ? "100%" : undefined,
        height: fullSize ? "100%" : undefined,
        minHeight: fullSize ? undefined : 80,
        padding: 16,
        borderRadius: fullSize ? 0 : 8,
        border: selected ?  `2px solid ${COLORS.blue400}"` : `1px solid ${COLORS.gray400}`,
        backgroundColor: "#FFFFFF",
        boxShadow: fullSize ? "none" : "0 1px 2px rgba(15, 23, 42, 0.08)",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  )
}
