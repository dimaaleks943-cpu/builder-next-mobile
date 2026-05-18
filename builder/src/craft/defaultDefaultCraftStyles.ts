import { PreviewViewport } from "../pages/builder/builder.enum.ts"
import type { ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"

/** Дефолтные props Craft-ноды Body (ROOT холста и пустая страница). */
export const BODY_CRAFT_DEFAULT_PROPS: { style: ResponsiveStyle } = {
  style: {
    [PreviewViewport.DESKTOP]: {
      display: "block",
      boxSizing: "border-box",
      position: "relative",
      width: "100%",
    },
  },
}
