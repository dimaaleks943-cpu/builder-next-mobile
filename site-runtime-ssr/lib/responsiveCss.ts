import type { ComponentNode } from "./interface"

export enum ResponsiveBranch {
  DESKTOP = "desktop",
  TABLET_LANDSCAPE = "tablet_landscape",
  TABLET = "tablet",
  PHONE_LANDSCAPE = "phone_landscape",
  PHONE = "phone",
}

type StyleRecord = Record<string, unknown>
type ResponsiveStyle = Partial<Record<ResponsiveBranch, StyleRecord>>

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

const withOpacity = (color: string, opacity: number): string => {
  const normalizedOpacity = Math.max(0, Math.min(1, opacity))
  const hex = color.trim()
  const shortHexMatch = /^#([a-f\d]{3})$/i.exec(hex)
  if (shortHexMatch) {
    const [r, g, b] = shortHexMatch[1].split("").map((part) => `${part}${part}`)
    return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${normalizedOpacity})`
  }

  const longHexMatch = /^#([a-f\d]{6})$/i.exec(hex)
  if (longHexMatch) {
    const parts = longHexMatch[1]
    const r = parseInt(parts.slice(0, 2), 16)
    const g = parseInt(parts.slice(2, 4), 16)
    const b = parseInt(parts.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${normalizedOpacity})`
  }

  const rgbMatch = /^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/i.exec(hex)
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${normalizedOpacity})`
  }

  return color
}

const toTextDecoration = (isUnderline: unknown, isStrike: unknown): string | undefined => {
  const tokens: string[] = []
  if (isUnderline === true) tokens.push("underline")
  if (isStrike === true) tokens.push("line-through")
  return tokens.length > 0 ? tokens.join(" ") : undefined
}

const styleBranchToCssDeclarations = (style: StyleRecord): Record<string, string> => {
  const declarations: Record<string, string> = {}

  const set = (property: string, value: string | undefined) => {
    if (value !== undefined) declarations[property] = value
  }

  const layout = typeof style.layout === "string" ? style.layout : undefined
  if (layout === "flex") {
    set("display", "flex")
  } else if (layout === "grid") {
    set("display", "grid")
  } else if (layout === "block") {
    set("display", "block")
  }

  // -- PositioningAccordion   --///
  if (typeof style.position === "string") set("position", style.position)
  if (typeof style.float === "string") set("float", style.float)
  if (typeof style.clear === "string") set("clear", style.clear)

  set("width", style.fullSize === true ? "100%" : toCssLength(style.width))
  set("height", style.fullSize === true ? "100%" : toCssLength(style.height))
  set("min-width", toCssLength(style.minWidth))
  set("min-height", toCssLength(style.minHeight))
  set("max-width", toCssLength(style.maxWidth))
  set("max-height", toCssLength(style.maxHeight))

  if (typeof style.overflow === "string") set("overflow", style.overflow)

  const gridColumns = asNumber(style.gridColumns)
  if (gridColumns && gridColumns > 0) {
    set("grid-template-columns", `repeat(${gridColumns}, minmax(0, 1fr))`)
  }
  const gridRows = asNumber(style.gridRows)
  if (gridRows && gridRows > 0) {
    set("grid-template-rows", `repeat(${gridRows}, auto)`)
  }
  if (typeof style.gridAutoFlow === "string") set("grid-auto-flow", style.gridAutoFlow)
  set("gap", toCssLength(style.gap))

  const flexFlow = typeof style.flexFlow === "string" ? style.flexFlow : undefined
  if (flexFlow) {
    set("flex-direction", flexFlow === "column" ? "column" : "row")
    set("flex-wrap", flexFlow === "wrap" ? "wrap" : "nowrap")
  }
  if (typeof style.flexJustifyContent === "string") set("justify-content", style.flexJustifyContent)
  if (typeof style.flexAlignItems === "string") set("align-items", style.flexAlignItems)
  if (typeof style.placeItemsY === "string" && typeof style.placeItemsX === "string") {
    set("place-items", `${style.placeItemsY} ${style.placeItemsX}`)
  }

  set("margin-top", toCssLength(style.marginTop))
  set("margin-right", toCssLength(style.marginRight))
  set("margin-bottom", toCssLength(style.marginBottom))
  set("margin-left", toCssLength(style.marginLeft))
  set("padding-top", toCssLength(style.paddingTop))
  set("padding-right", toCssLength(style.paddingRight))
  set("padding-bottom", toCssLength(style.paddingBottom))
  set("padding-left", toCssLength(style.paddingLeft))

  set("border-radius", toCssLength(style.borderRadius))
  set("border-top-width", toCssLength(style.borderTopWidth))
  set("border-right-width", toCssLength(style.borderRightWidth))
  set("border-bottom-width", toCssLength(style.borderBottomWidth))
  set("border-left-width", toCssLength(style.borderLeftWidth))
  if (typeof style.borderStyle === "string") set("border-style", style.borderStyle)
  if (typeof style.borderColor === "string") {
    const borderOpacity = asNumber(style.borderOpacity)
    const effectiveColor =
      borderOpacity !== undefined
        ? withOpacity(style.borderColor, borderOpacity)
        : style.borderColor
    set("border-color", effectiveColor)
  }

  if (typeof style.backgroundColor === "string") set("background-color", style.backgroundColor)
  if (typeof style.backgroundClip === "string") set("background-clip", style.backgroundClip)

  set("font-size", toCssLength(style.fontSize))
  if (typeof style.fontWeight === "string") set("font-weight", style.fontWeight)
  if (typeof style.textAlign === "string") set("text-align", style.textAlign)
  if (typeof style.color === "string") set("color", style.color)
  if (typeof style.fontFamily === "string") set("font-family", style.fontFamily)
  set("line-height", toCssLength(style.lineHeight))
  if (typeof style.textTransform === "string") set("text-transform", style.textTransform)
  const textDecoration = toTextDecoration(style.isUnderline, style.isStrikethrough)
  if (textDecoration) set("text-decoration", textDecoration)
  if (style.isItalic === true) set("font-style", "italic")
  if (typeof style.strokeColor === "string") set("-webkit-text-stroke-color", style.strokeColor)
  set("-webkit-text-stroke-width", toCssLength(style.strokeWidth))

  if (typeof style.mixBlendMode === "string") set("mix-blend-mode", style.mixBlendMode)
  const opacityPercent = asNumber(style.opacityPercent)
  if (opacityPercent !== undefined) {
    set("opacity", String(Math.max(0, Math.min(100, opacityPercent)) / 100))
  }
  if (typeof style.outlineStyleMode === "string" && style.outlineStyleMode !== "none") {
    set("outline-style", style.outlineStyleMode)
    set("outline-width", toCssLength(style.outlineWidth) ?? "1px")
    set("outline-offset", toCssLength(style.outlineOffset) ?? "0px")
    if (typeof style.outlineColor === "string") set("outline-color", style.outlineColor)
  }

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
