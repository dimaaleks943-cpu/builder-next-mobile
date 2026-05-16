import { COLORS } from "../../../theme/colors.ts"
import { PreviewViewport } from "../builder.enum.ts"
import { CRAFT_DISPLAY_NAME } from "../../../craft/craftDisplayNames.ts"
import type { ResponsiveStyle } from "../responsiveStyle.ts"

/**
 * init стили крафт компонент, необходимы для крафт компонент что бы те не терялись на холсте при расположении
 * учитываются при чтении/записи стилей вместе с классом и локальными props.style
 * TODO после правок компонент будут использовать только для первичной записи
 */
export const CRAFT_INTRINSIC_STYLES: Record<string, ResponsiveStyle> = {
  [CRAFT_DISPLAY_NAME.Block]: {
    [PreviewViewport.DESKTOP]: {
      display: "block",
      height: "20px",
      boxSizing: "border-box",
    },
  },
  [CRAFT_DISPLAY_NAME.Body]: {
    [PreviewViewport.DESKTOP]: {
      display: "block",
      boxSizing: "border-box",
      position: "relative",
      width: "100%",
    },
  },
  [CRAFT_DISPLAY_NAME.Text]: {
    [PreviewViewport.DESKTOP]: {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: "normal",
      color: COLORS.gray700,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
    },
  },
  [CRAFT_DISPLAY_NAME.LinkText]: {
    [PreviewViewport.DESKTOP]: {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: "normal",
      color: COLORS.green300,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
    },
  },
  [CRAFT_DISPLAY_NAME.Image]: {
    [PreviewViewport.DESKTOP]: {},
  },
  [CRAFT_DISPLAY_NAME.ContentList]: {
    [PreviewViewport.DESKTOP]: {
      itemsPerRow: 1,
    },
  },
  [CRAFT_DISPLAY_NAME.ContentListCell]: {
    [PreviewViewport.DESKTOP]: {
      display: "block",
      padding: "16px",
      gridAutoFlow: "row",
      flexFlow: "row",
    },
  },
  [CRAFT_DISPLAY_NAME.CategoryFilter]: {
    [PreviewViewport.DESKTOP]: {
      width: "100%",
      minHeight: 48,
    },
  },
}

export const getCraftIntrinsicStyle = (
  resolvedName: string,
): ResponsiveStyle | undefined => CRAFT_INTRINSIC_STYLES[resolvedName]
