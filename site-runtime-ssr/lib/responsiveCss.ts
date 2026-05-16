import type { ComponentNode } from "./interface"

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
const TABLET_LANDSCAPE_MEDIA = "@media (max-width: 1279px)"
const TABLET_MEDIA = "@media (max-width: 1023px)"
const PHONE_LANDSCAPE_MEDIA = "@media (max-width: 767px)"
const PHONE_MEDIA = "@media (max-width: 567px)"

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
  const declarations: Record<string, string> = {}

  const set = (property: string, value: string | undefined) => {
    if (value !== undefined) declarations[property] = value
  }

  // -- PositioningAccordion --//
  const zIndexValue = asNumber(style.zIndex ?? style["z-index"])
  if (zIndexValue !== undefined) set("z-index", String(zIndexValue))
  if (typeof style.inset === "string") set("inset", style.inset)
  if (typeof style.position === "string") set("position", style.position)
  if (typeof style.float === "string") set("float", style.float)
  if (typeof style.clear === "string") set("clear", style.clear)

  // -- BorderAccordion --//
  set("border-radius", toCssLength(style.borderRadius))
  set("border-top-width", toCssLength(style.borderTopWidth))
  set("border-right-width", toCssLength(style.borderRightWidth))
  set("border-bottom-width", toCssLength(style.borderBottomWidth))
  set("border-left-width", toCssLength(style.borderLeftWidth))
  if (typeof style.borderStyle === "string") set("border-style", style.borderStyle)
  if (typeof style.borderColor === "string") set("border-color", style.borderColor)

  // -- TypographyAccordion --//
  if (typeof style.fontFamily === "string") set("font-family", style.fontFamily)
  set("font-size", toCssLength(style.fontSize))
  set("line-height", toCssLength(style.lineHeight))
  set("font-weight", toFontWeight(style.fontWeight))
  if (typeof style.textAlign === "string") set("text-align", style.textAlign)
  if (typeof style.color === "string") set("color", style.color)
  if (typeof style.textTransform === "string") set("text-transform", style.textTransform)
  if (typeof style.strokeColor === "string") set("-webkit-text-stroke-color", style.strokeColor)
  set("-webkit-text-stroke-width", toCssLength(style.strokeWidth))
  const textDecorationFromFlags = toTextDecoration(style.isUnderline, style.isStrikethrough)
  if (typeof style.textDecoration === "string") {
    set("text-decoration", style.textDecoration)
  } else if (textDecorationFromFlags) {
    set("text-decoration", textDecorationFromFlags)
  }
  if (typeof style.textDecorationSkipInk === "string") {
    set("text-decoration-skip-ink", style.textDecorationSkipInk)
  }
  if (typeof style.fontStyle === "string") {
    set("font-style", style.fontStyle)
  } else if (style.isItalic === true) {
    set("font-style", "italic")
  }
  set("letter-spacing", toCssLength(style.letterSpacing))
  set("text-indent", toCssLength(style.textIndent))
  if (typeof style.textShadow === "string") set("text-shadow", style.textShadow)
  set("column-count", toColumnCount(style.columnCount))
  set("column-gap", toCssLength(style.columnGap))
  if (typeof style.columnRule === "string") set("column-rule", style.columnRule)
  if (typeof style.columnRuleStyle === "string") set("column-rule-style", style.columnRuleStyle)
  set("column-rule-width", toCssLength(style.columnRuleWidth))
  if (typeof style.columnRuleColor === "string") set("column-rule-color", style.columnRuleColor)
  if (typeof style.columnSpan === "string") set("column-span", style.columnSpan)
  if (typeof style.wordBreak === "string") set("word-break", style.wordBreak)
  if (typeof style.whiteSpace === "string") set("white-space", style.whiteSpace)
  if (typeof style.overflowWrap === "string") set("overflow-wrap", style.overflowWrap)
  if (typeof style.textOverflow === "string") set("text-overflow", style.textOverflow)

  // -- EffectsAccordion --//
  if (typeof style.mixBlendMode === "string") set("mix-blend-mode", style.mixBlendMode)
  set("opacity", toOpacity(style.opacity))
  if (typeof style.outline === "string") set("outline", style.outline)
  if (typeof style.outlineOffset === "string") set("outline-offset", style.outlineOffset)
  if (typeof style.boxShadow === "string") set("box-shadow", style.boxShadow)

  // -- BackgroundAccordion --//
  if (typeof style.backgroundColor === "string") set("background-color", style.backgroundColor)
  if (typeof style.backgroundImage === "string") set("background-image", style.backgroundImage)
  if (typeof style.backgroundSize === "string") set("background-size", style.backgroundSize)
  if (typeof style.backgroundPosition === "string") set("background-position", style.backgroundPosition)
  if (typeof style.backgroundRepeat === "string") set("background-repeat", style.backgroundRepeat)
  if (typeof style.backgroundAttachment === "string") {
    set("background-attachment", style.backgroundAttachment)
  }
  if (typeof style.backgroundClip === "string") set("background-clip", style.backgroundClip)
  if (typeof style.WebkitTextFillColor === "string") {
    set("-webkit-text-fill-color", style.WebkitTextFillColor)
  }

  // -- SizeAccordion --//
  set("width", style.fullSize === true ? "100%" : toCssLength(style.width))
  set("height", style.fullSize === true ? "100%" : toCssLength(style.height))
  set("min-width", toCssLength(style.minWidth))
  set("min-height", toCssLength(style.minHeight))
  set("max-width", toCssLength(style.maxWidth))
  set("max-height", toCssLength(style.maxHeight))
  if (typeof style.overflow === "string") set("overflow", style.overflow)
  set("aspect-ratio", toAspectRatio(style.aspectRatio))
  if (typeof style.boxSizing === "string") set("box-sizing", style.boxSizing)
  if (typeof style.objectFit === "string") set("object-fit", style.objectFit)
  if (typeof style.objectPosition === "string") set("object-position", style.objectPosition)

  // -- SpacingAccordion --//
  set("margin-top", toCssLength(style.marginTop))
  set("margin-right", toCssLength(style.marginRight))
  set("margin-bottom", toCssLength(style.marginBottom))
  set("margin-left", toCssLength(style.marginLeft))
  set("padding-top", toCssLength(style.paddingTop))
  set("padding-right", toCssLength(style.paddingRight))
  set("padding-bottom", toCssLength(style.paddingBottom))
  set("padding-left", toCssLength(style.paddingLeft))

  // -- LayoutAccordion --//
  if (typeof style.display === "string") set("display", style.display)
  if (typeof style.flexFlow === "string") set("flex-flow", style.flexFlow)
  if (typeof style.justifyContent === "string") set("justify-content", style.justifyContent)
  if (typeof style.alignItems === "string") set("align-items", style.alignItems)
  set("gap", toCssLength(style.gap))
  if (typeof style.gridTemplateColumns === "string") {
    set("grid-template-columns", style.gridTemplateColumns)
  }
  if (typeof style.gridTemplateRows === "string") {
    set("grid-template-rows", style.gridTemplateRows)
  }
  if (typeof style.gridAutoFlow === "string") set("grid-auto-flow", style.gridAutoFlow)
  if (typeof style.placeItems === "string") set("place-items", style.placeItems)

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

const collectNodes = (nodes: ComponentNode[]): ComponentNode[] => {
  const queue = [...nodes]
  const output: ComponentNode[] = []

  while (queue.length > 0) {
    const node = queue.shift()
    if (!node) continue
    output.push(node)
    if (Array.isArray(node.children) && node.children.length > 0) {
      queue.push(...node.children)
    }
  }

  return output
}

const pushRulesForResponsiveStyle = (
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

export const buildResponsiveCss = (nodes: ComponentNode[]): string => {
  if (!Array.isArray(nodes) || nodes.length === 0) return ""

  const allNodes = collectNodes(nodes)
  const baseRules: string[] = []
  const tabletLandscapeRules: string[] = []
  const tabletRules: string[] = []
  const phoneLandscapeRules: string[] = []
  const phoneRules: string[] = []

  for (const node of allNodes) {
    if (!node.className) continue
    const style = isRecord(node.props?.style)
      ? (node.props.style as ResponsiveStyle)
      : null
    if (style) {
      pushRulesForResponsiveStyle(
        `.${node.className}`,
        style,
        baseRules,
        tabletLandscapeRules,
        tabletRules,
        phoneLandscapeRules,
        phoneRules,
      )
    }

    // ContentListCell не входит в дерево ComponentNode — стили ячейки лежат в props.cellStyle.
    if (node.type === "ContentList") {
      const cellClass = node.props?.cellClassName
      const cellStyle = isRecord(node.props?.cellStyle)
        ? (node.props.cellStyle as ResponsiveStyle)
        : null
      if (typeof cellClass === "string" && cellClass.trim() && cellStyle) {
        pushRulesForResponsiveStyle(
          `.${cellClass.trim()}`,
          cellStyle,
          baseRules,
          tabletLandscapeRules,
          tabletRules,
          phoneLandscapeRules,
          phoneRules,
        )
      }
    }
  }

  const cssParts: string[] = []
  if (baseRules.length > 0) cssParts.push(baseRules.join(""))
  if (tabletLandscapeRules.length > 0) cssParts.push(`${TABLET_LANDSCAPE_MEDIA}{${tabletLandscapeRules.join("")}}`)
  if (tabletRules.length > 0) cssParts.push(`${TABLET_MEDIA}{${tabletRules.join("")}}`)
  if (phoneLandscapeRules.length > 0) cssParts.push(`${PHONE_LANDSCAPE_MEDIA}{${phoneLandscapeRules.join("")}}`)
  if (phoneRules.length > 0) cssParts.push(`${PHONE_MEDIA}{${phoneRules.join("")}}`)

  return cssParts.join("")
}
