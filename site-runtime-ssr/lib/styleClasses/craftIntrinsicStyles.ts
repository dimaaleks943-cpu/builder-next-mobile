import { ResponsiveBranch, type ResponsiveStyle } from "../responsiveCss"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames"

/** Default styles from Craft `.craft.props.style` (builder `craftIntrinsicStyles.ts`). */
export const CRAFT_INTRINSIC_STYLES: Record<string, ResponsiveStyle> = {
  [CRAFT_DISPLAY_NAME.Block]: {
    [ResponsiveBranch.DESKTOP]: {
      display: "block",
      height: "20px",
      boxSizing: "border-box",
    },
  },
  [CRAFT_DISPLAY_NAME.Body]: {
    [ResponsiveBranch.DESKTOP]: {
      display: "block",
      boxSizing: "border-box",
      position: "relative",
      width: "100%",
    },
  },
  [CRAFT_DISPLAY_NAME.Text]: {
    [ResponsiveBranch.DESKTOP]: {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: "normal",
      color: "#727280",
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
    },
  },
  [CRAFT_DISPLAY_NAME.LinkText]: {
    [ResponsiveBranch.DESKTOP]: {
      fontSize: "14px",
      lineHeight: "20px",
      fontWeight: "normal",
      color: "#00C78D",
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
    },
  },
  [CRAFT_DISPLAY_NAME.Image]: {
    [ResponsiveBranch.DESKTOP]: {},
  },
  [CRAFT_DISPLAY_NAME.ContentList]: {
    [ResponsiveBranch.DESKTOP]: {
      itemsPerRow: 1,
    },
  },
  [CRAFT_DISPLAY_NAME.ContentListCell]: {
    [ResponsiveBranch.DESKTOP]: {
      display: "block",
      padding: "16px",
      gridAutoFlow: "row",
      flexFlow: "row",
    },
  },
  [CRAFT_DISPLAY_NAME.CategoryFilter]: {
    [ResponsiveBranch.DESKTOP]: {
      width: "100%",
      minHeight: 48,
    },
  },
}

export const getCraftIntrinsicStyle = (
  displayName: string,
): ResponsiveStyle | undefined => CRAFT_INTRINSIC_STYLES[displayName]
