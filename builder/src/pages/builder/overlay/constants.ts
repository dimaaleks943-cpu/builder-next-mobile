import { CRAFT_DISPLAY_NAME } from "../../../craft/craftDisplayNames.ts"
import { COLORS } from "../../../theme/colors"

export const OVERLAY_OUTLINE_BORDER = `2px solid ${COLORS.purple400}`
export const OVERLAY_BADGE_OFFSET_Y = 24
export const OVERLAY_BADGE_GAP_Y = 6

/** Ключи resolver (`Editor resolver`), когда в state есть `type.resolvedName`. */
export const CRAFT_INLINE_SETTINGS_RESOLVED_NAMES = new Set([
  "Text",
  "LinkText",
  "Image",
  "ContentList",
  "CategoryFilter",
])

/**
 * Значения, которые реально попадают в текст бирки через {@link resolveNodeDisplayName}:
 * чаще всего `data.displayName` (`Craft*`), иначе fallback на `resolvedName`.
 */
export const CRAFT_INLINE_SETTINGS_BADGE_LABELS = new Set<string>([
  ...CRAFT_INLINE_SETTINGS_RESOLVED_NAMES,
  CRAFT_DISPLAY_NAME.Text,
  CRAFT_DISPLAY_NAME.LinkText,
  CRAFT_DISPLAY_NAME.Image,
  CRAFT_DISPLAY_NAME.ContentList,
  CRAFT_DISPLAY_NAME.CategoryFilter,
])
