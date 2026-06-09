import { useNode } from "@craftjs/core"
import type { CSSProperties, ReactNode } from "react"
import { CRAFT_DISPLAY_NAME } from "../../craftDisplayNames.ts"
import type { ResponsiveStyle } from "../../../pages/builder/responsiveStyle.ts"
import { useCraftNodeStyle } from "../../../pages/builder/hooks/useCraftNodeStyle.ts"
import { PreviewViewport } from "../../../pages/builder/builder.enum.ts"
import { useNavbarMenu } from "../../../pages/builder/context/navbarMenuContext.tsx"

interface Props {
  children?: ReactNode
  style?: ResponsiveStyle
  styleClassIds?: string[]
}

export const CraftNavbarLinks = (props: Props) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const { isCompact } = useNavbarMenu()
  const {
    connectors: { connect, drag },
  } = useNode()

  const mergedStyle: CSSProperties = {
    ...(responsiveStyle as CSSProperties),
    ...(isCompact ? { display: "none" } : {}),
  }

  return (
    <div
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      style={mergedStyle}
    >
      {!isCompact ? props.children : null}
    </div>
  )
};

(CraftNavbarLinks as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.NavbarLinks,
  props: {
    style: {
      [PreviewViewport.DESKTOP]: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
      },
    },
  },
  rules: {
    canMoveIn: () => true,
  },
  isCanvas: true,
}
