import { useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { CRAFT_DISPLAY_NAME } from "../craftDisplayNames.ts"
import type { ResponsiveStyle } from "../../pages/builder/responsiveStyle.ts"
import { useCraftNodeStyle } from "../../pages/builder/hooks/useCraftNodeStyle.ts"
import { PreviewViewport } from "../../pages/builder/builder.enum.ts"
import { BurgerIcon } from "../../icons/BurgerIcon.tsx"
import { COLORS } from "../../theme/colors.ts"

export type CraftIconVariant = "burger"

export interface Props {
  icon?: CraftIconVariant
  style?: ResponsiveStyle
  styleClassIds?: string[]
}

export const CraftIcon = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const iconFill = (responsiveStyle.color as string | undefined) ?? COLORS.purple400
  const icon = props.icon ?? "burger"
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      style={responsiveStyle as CSSProperties}
    >
      {icon === "burger" && <BurgerIcon fill={iconFill} />}
    </div>
  )
};

(CraftIcon as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.Icon,
  props: {
    icon: "burger" as const,
    style: {
      [PreviewViewport.DESKTOP]: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      },
    },
  },
  rules: {
    canMoveIn: () => false,
  },
}
