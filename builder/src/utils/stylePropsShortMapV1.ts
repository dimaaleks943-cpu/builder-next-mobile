/**
 * Единый словарь сокращений CSS-style props (v1).
 *
 * Правила:
 * - m* для margin, p* для padding, b* для border;
 * - составные свойства сокращаются предсказуемо (например, borderTopWidth -> btw);
 * - новые style-props добавляются только через этот маппинг.
 */
export const FULL_TO_SHORT = {
  //-- PositioningAccordion --//
  position: "ps",
  float: "flt",
  clear: "clr",
  zIndex: "zi",
  inset: "ins",
  
  // layout
  layout: "ly",
  /** Элементов в строке сетки списка (ContentList). */
  itemsPerRow: "ipr",
  fullSize: "fs",
  gridColumns: "gcl",
  gridRows: "grw",
  gridAutoFlow: "gaf",
  gap: "gp",
  flexFlow: "ff",
  flexJustifyContent: "fjc",
  flexAlignItems: "fai",
  placeItemsY: "piy",
  placeItemsX: "pix",

  // spacing
  marginTop: "mt",
  marginRight: "mr",
  marginBottom: "mb",
  marginLeft: "ml",
  paddingTop: "pt",
  paddingRight: "pr",
  paddingBottom: "pb",
  paddingLeft: "pl",

  // border
  borderRadius: "br",
  borderTopWidth: "btw",
  borderRightWidth: "brw",
  borderBottomWidth: "bbw",
  borderLeftWidth: "blw",
  borderColor: "bc",
  borderStyle: "bs",
  borderOpacity: "bo",

  // background
  backgroundColor: "bgc",
  backgroundClip: "bgcl",

  // size
  width: "w",
  height: "h",
  minWidth: "miw",
  minHeight: "mih",
  maxWidth: "maw",
  maxHeight: "mah",
  overflow: "ovf",

  // typography
  fontSize: "fz",
  fontWeight: "fw",
  textAlign: "ta",
  color: "cl",
  fontFamily: "ffm",
  lineHeight: "lh",
  textTransform: "tt",
  strokeColor: "sc",
  strokeWidth: "sw",
  isItalic: "ii",
  isUnderline: "iu",
  isStrikethrough: "is",
} as const

export type FullStylePropKey = keyof typeof FULL_TO_SHORT
export type ShortStylePropKey = (typeof FULL_TO_SHORT)[FullStylePropKey]

export const SHORT_TO_FULL = Object.entries(FULL_TO_SHORT).reduce(
  (acc, [full, short]) => {
    if (acc[short as ShortStylePropKey]) {
      throw new Error(
        `[stylePropsShortMapV1] Duplicate short key "${short}" for "${full}" and "${acc[short as ShortStylePropKey]}"`,
      )
    }
    acc[short as ShortStylePropKey] = full as FullStylePropKey
    return acc
  },
  {} as Record<ShortStylePropKey, FullStylePropKey>,
)

