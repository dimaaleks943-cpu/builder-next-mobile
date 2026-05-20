import { resolveDesignVariableRefs } from "@/lib/variables/resolveDesignVariableRefs"

export enum ResponsiveBranch {
  DESKTOP = "desktop",
  TABLET_LANDSCAPE = "tablet_landscape",
  TABLET = "tablet",
  PHONE_LANDSCAPE = "phone_landscape",
  PHONE = "phone",
}

type StyleRecord = Record<string, unknown>
export type ResponsiveStyle = Partial<Record<ResponsiveBranch, StyleRecord>>

export const BRANCHES: ResponsiveBranch[] = [
  ResponsiveBranch.DESKTOP,
  ResponsiveBranch.TABLET_LANDSCAPE,
  ResponsiveBranch.TABLET,
  ResponsiveBranch.PHONE_LANDSCAPE,
  ResponsiveBranch.PHONE,
]
export const BRANCH_MEDIA = {
  tabletLandscape: "@media (max-width: 1279px)",
  tablet: "@media (max-width: 1023px)",
  phoneLandscape: "@media (max-width: 767px)",
  phone: "@media (max-width: 567px)",
} as const

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value)

const toCssLength = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}px`
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim()
  }
  return undefined
}

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

const toTextDecoration = (isUnderline: unknown, isStrike: unknown): string | undefined => {
  const tokens: string[] = []
  if (isUnderline === true) tokens.push("underline")
  if (isStrike === true) tokens.push("line-through")
  return tokens.length > 0 ? tokens.join(" ") : undefined
}

const toOpacity = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  if (typeof value === "string" && value.trim().length > 0) return value.trim()
  return undefined
}

const toAspectRatio = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  if (typeof value === "string" && value.trim().length > 0) return value.trim()
  return undefined
}

const toColumnCount = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return String(Math.trunc(value))
  if (typeof value === "string" && value.trim().length > 0) return value.trim()
  return undefined
}

const toFontWeight = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  if (typeof value === "string" && value.trim().length > 0) return value.trim()
  return undefined
}

const styleBranchToCssDeclarations = (style: StyleRecord): Record<string, string> => {
  const resolvedStyle = resolveDesignVariableRefs(style) as StyleRecord
  const declarations: Record<string, string> = {}

  const set = (property: string, value: string | undefined) => {
    if (value !== undefined) declarations[property] = value
  }

  // -- PositioningAccordion --//
  const zIndexValue = asNumber(resolvedStyle.zIndex ?? resolvedStyle["z-index"])
  if (zIndexValue !== undefined) set("z-index", String(zIndexValue))
  if (typeof resolvedStyle.inset === "string") set("inset", resolvedStyle.inset)
  if (typeof resolvedStyle.position === "string") set("position", resolvedStyle.position)
  if (typeof resolvedStyle.float === "string") set("float", resolvedStyle.float)
  if (typeof resolvedStyle.clear === "string") set("clear", resolvedStyle.clear)

  // -- BorderAccordion --//
  set("border-radius", toCssLength(resolvedStyle.borderRadius))
  set("border-top-width", toCssLength(resolvedStyle.borderTopWidth))
  set("border-right-width", toCssLength(resolvedStyle.borderRightWidth))
  set("border-bottom-width", toCssLength(resolvedStyle.borderBottomWidth))
  set("border-left-width", toCssLength(resolvedStyle.borderLeftWidth))
  if (typeof resolvedStyle.borderStyle === "string") set("border-style", resolvedStyle.borderStyle)
  if (typeof resolvedStyle.borderColor === "string") set("border-color", resolvedStyle.borderColor)

  // -- TypographyAccordion --//
  if (typeof resolvedStyle.fontFamily === "string") set("font-family", resolvedStyle.fontFamily)
  set("font-size", toCssLength(resolvedStyle.fontSize))
  set("line-height", toCssLength(resolvedStyle.lineHeight))
  set("font-weight", toFontWeight(resolvedStyle.fontWeight))
  if (typeof resolvedStyle.textAlign === "string") set("text-align", resolvedStyle.textAlign)
  if (typeof resolvedStyle.color === "string") set("color", resolvedStyle.color)
  if (typeof resolvedStyle.textTransform === "string") set("text-transform", resolvedStyle.textTransform)
  if (typeof resolvedStyle.strokeColor === "string") set("-webkit-text-stroke-color", resolvedStyle.strokeColor)
  set("-webkit-text-stroke-width", toCssLength(resolvedStyle.strokeWidth))
  const textDecorationFromFlags = toTextDecoration(resolvedStyle.isUnderline, resolvedStyle.isStrikethrough)
  if (typeof resolvedStyle.textDecoration === "string") {
    set("text-decoration", resolvedStyle.textDecoration)
  } else if (textDecorationFromFlags) {
    set("text-decoration", textDecorationFromFlags)
  }
  if (typeof resolvedStyle.textDecorationSkipInk === "string") {
    set("text-decoration-skip-ink", resolvedStyle.textDecorationSkipInk)
  }
  if (typeof resolvedStyle.fontStyle === "string") {
    set("font-style", resolvedStyle.fontStyle)
  } else if (resolvedStyle.isItalic === true) {
    set("font-style", "italic")
  }
  set("letter-spacing", toCssLength(resolvedStyle.letterSpacing))
  set("text-indent", toCssLength(resolvedStyle.textIndent))
  if (typeof resolvedStyle.textShadow === "string") set("text-shadow", resolvedStyle.textShadow)
  set("column-count", toColumnCount(resolvedStyle.columnCount))
  set("column-gap", toCssLength(resolvedStyle.columnGap))
  if (typeof resolvedStyle.columnRule === "string") set("column-rule", resolvedStyle.columnRule)
  if (typeof resolvedStyle.columnRuleStyle === "string") set("column-rule-style", resolvedStyle.columnRuleStyle)
  set("column-rule-width", toCssLength(resolvedStyle.columnRuleWidth))
  if (typeof resolvedStyle.columnRuleColor === "string") set("column-rule-color", resolvedStyle.columnRuleColor)
  if (typeof resolvedStyle.columnSpan === "string") set("column-span", resolvedStyle.columnSpan)
  if (typeof resolvedStyle.wordBreak === "string") set("word-break", resolvedStyle.wordBreak)
  if (typeof resolvedStyle.whiteSpace === "string") set("white-space", resolvedStyle.whiteSpace)
  if (typeof resolvedStyle.overflowWrap === "string") set("overflow-wrap", resolvedStyle.overflowWrap)
  if (typeof resolvedStyle.textOverflow === "string") set("text-overflow", resolvedStyle.textOverflow)

  // -- EffectsAccordion --//
  if (typeof resolvedStyle.mixBlendMode === "string") set("mix-blend-mode", resolvedStyle.mixBlendMode)
  set("opacity", toOpacity(resolvedStyle.opacity))
  if (typeof resolvedStyle.outline === "string") set("outline", resolvedStyle.outline)
  if (typeof resolvedStyle.outlineOffset === "string") set("outline-offset", resolvedStyle.outlineOffset)
  if (typeof resolvedStyle.boxShadow === "string") set("box-shadow", resolvedStyle.boxShadow)

  // -- BackgroundAccordion --//
  if (typeof resolvedStyle.backgroundColor === "string") set("background-color", resolvedStyle.backgroundColor)
  if (typeof resolvedStyle.backgroundImage === "string") set("background-image", resolvedStyle.backgroundImage)
  if (typeof resolvedStyle.backgroundSize === "string") set("background-size", resolvedStyle.backgroundSize)
  if (typeof resolvedStyle.backgroundPosition === "string") set("background-position", resolvedStyle.backgroundPosition)
  if (typeof resolvedStyle.backgroundRepeat === "string") set("background-repeat", resolvedStyle.backgroundRepeat)
  if (typeof resolvedStyle.backgroundAttachment === "string") {
    set("background-attachment", resolvedStyle.backgroundAttachment)
  }
  if (typeof resolvedStyle.backgroundClip === "string") set("background-clip", resolvedStyle.backgroundClip)
  if (typeof resolvedStyle.WebkitTextFillColor === "string") {
    set("-webkit-text-fill-color", resolvedStyle.WebkitTextFillColor)
  }

  // -- SizeAccordion --//
  set("width", resolvedStyle.fullSize === true ? "100%" : toCssLength(resolvedStyle.width))
  set("height", resolvedStyle.fullSize === true ? "100%" : toCssLength(resolvedStyle.height))
  set("min-width", toCssLength(resolvedStyle.minWidth))
  set("min-height", toCssLength(resolvedStyle.minHeight))
  set("max-width", toCssLength(resolvedStyle.maxWidth))
  set("max-height", toCssLength(resolvedStyle.maxHeight))
  if (typeof resolvedStyle.overflow === "string") set("overflow", resolvedStyle.overflow)
  set("aspect-ratio", toAspectRatio(resolvedStyle.aspectRatio))
  if (typeof resolvedStyle.boxSizing === "string") set("box-sizing", resolvedStyle.boxSizing)
  if (typeof resolvedStyle.objectFit === "string") set("object-fit", resolvedStyle.objectFit)
  if (typeof resolvedStyle.objectPosition === "string") set("object-position", resolvedStyle.objectPosition)

  // -- SpacingAccordion --//
  set("margin-top", toCssLength(resolvedStyle.marginTop))
  set("margin-right", toCssLength(resolvedStyle.marginRight))
  set("margin-bottom", toCssLength(resolvedStyle.marginBottom))
  set("margin-left", toCssLength(resolvedStyle.marginLeft))
  set("padding-top", toCssLength(resolvedStyle.paddingTop))
  set("padding-right", toCssLength(resolvedStyle.paddingRight))
  set("padding-bottom", toCssLength(resolvedStyle.paddingBottom))
  set("padding-left", toCssLength(resolvedStyle.paddingLeft))

  // -- LayoutAccordion --//
  if (typeof resolvedStyle.display === "string") set("display", resolvedStyle.display)
  if (typeof resolvedStyle.flexFlow === "string") set("flex-flow", resolvedStyle.flexFlow)
  if (typeof resolvedStyle.justifyContent === "string") set("justify-content", resolvedStyle.justifyContent)
  if (typeof resolvedStyle.alignItems === "string") set("align-items", resolvedStyle.alignItems)
  set("gap", toCssLength(resolvedStyle.gap))
  if (typeof resolvedStyle.gridTemplateColumns === "string") {
    set("grid-template-columns", resolvedStyle.gridTemplateColumns)
  }
  if (typeof resolvedStyle.gridTemplateRows === "string") {
    set("grid-template-rows", resolvedStyle.gridTemplateRows)
  }
  if (typeof resolvedStyle.gridAutoFlow === "string") set("grid-auto-flow", resolvedStyle.gridAutoFlow)
  if (typeof resolvedStyle.placeItems === "string") set("place-items", resolvedStyle.placeItems)

  // -- Non-css / consumed elsewhere (stylePropsShortMapV1: itemsPerRow, fullSize) --//
  // itemsPerRow — только для ContentList в данных узла, не объявление CSS селектора.
  // fullSize — учтён выше в width/height (100%).
  // isItalic / isUnderline / isStrikethrough — legacy-флаги; при наличии fontStyle / textDecoration в данных они не дублируют CSS.

  return declarations
}

const toCssRule = (selector: string, declarations: Record<string, string>): string => {
  const body = Object.entries(declarations)
    .map(([prop, value]) => `${prop}:${value};`)
    .join("")
  return body.length > 0 ? `${selector}{${body}}` : ""
}

export const pushRulesForResponsiveStyle = (
  selector: string,
  style: ResponsiveStyle | null | undefined,
  baseRules: string[],
  tabletLandscapeRules: string[],
  tabletRules: string[],
  phoneLandscapeRules: string[],
  phoneRules: string[],
) => {
  if (!style) return

  for (const branch of BRANCHES) {
    const branchStyle = style[branch]
    if (!isRecord(branchStyle)) continue
    const rule = toCssRule(selector, styleBranchToCssDeclarations(branchStyle))
    if (!rule) continue

    switch (branch) {
      case ResponsiveBranch.DESKTOP:
        baseRules.push(rule)
        break
      case ResponsiveBranch.TABLET_LANDSCAPE:
        tabletLandscapeRules.push(rule)
        break
      case ResponsiveBranch.TABLET:
        tabletRules.push(rule)
        break
      case ResponsiveBranch.PHONE_LANDSCAPE:
        phoneLandscapeRules.push(rule)
        break
      case ResponsiveBranch.PHONE:
        phoneRules.push(rule)
        break
    }
  }
}

