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

  //-- BorderAccordion --//
  borderRadius: "br",
  borderTopWidth: "btw",
  borderRightWidth: "brw",
  borderBottomWidth: "bbw",
  borderLeftWidth: "blw",
  borderColor: "bc",
  borderStyle: "bs",

  //-- TypographyAccordion --//
  fontFamily: "ffm",
  fontSize: "fz",
  lineHeight: "lh",
  fontWeight: "fw",
  textAlign: "ta",
  color: "cl",
  textTransform: "tt",
  strokeColor: "sc",
  strokeWidth: "sw",
  textDecoration: "td",
  textDecorationSkipInk: "tdsi",
  fontStyle: "fst",
  letterSpacing: "ls",
  textIndent: "ti",
  textShadow: "txs",
  columnCount: "cc",
  columnGap: "cg",
  columnRule: "crl",
  columnRuleStyle: "crs",
  columnRuleWidth: "crw",
  columnRuleColor: "crc",
  columnSpan: "csp",
  wordBreak: "wb",
  whiteSpace: "wsp",
  overflowWrap: "ow",
  textOverflow: "to",

  //-- EffectsAccordion --//
  mixBlendMode: "mbm",
  opacity: "op",
  outline: "oln",
  outlineOffset: "ofo",
  boxShadow: "bxs",

  //-- BackgroundAccordion --//
  backgroundColor: "bgc",
  backgroundImage: "bgi",
  backgroundSize: "bgsz",
  backgroundPosition: "bgp",
  backgroundRepeat: "bgrp",
  backgroundAttachment: "bga",
  backgroundClip: "bgcl",
  WebkitTextFillColor: "wtfc",

  //-- SizeAccordion --//
  width: "w",
  height: "h",
  minWidth: "miw",
  minHeight: "mih",
  maxWidth: "maw",
  maxHeight: "mah",
  overflow: "ovf",
  aspectRatio: "asp",
  boxSizing: "bxsz",
  objectFit: "objf",
  objectPosition: "objp",

  //-- SpacingAccordion --//
  marginTop: "mt",
  marginRight: "mr",
  marginBottom: "mb",
  marginLeft: "ml",
  paddingTop: "pt",
  paddingRight: "pr",
  paddingBottom: "pb",
  paddingLeft: "pl",

  //-- LayoutAccordion --//
  display: "dsp",
  gridTemplateColumns: "gtc",
  gridTemplateRows: "gtr",
  justifyContent: "juc",
  alignItems: "ali",
  placeItems: "pit",
  gap: "gp",

  // layout
  /** Элементов в строке сетки списка (ContentList). */
  itemsPerRow: "ipr",
  fullSize: "fs",
  gridAutoFlow: "gaf",
  flexFlow: "ff",
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
