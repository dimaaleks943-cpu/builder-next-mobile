import {
  BRANCH_MEDIA,
  pushRulesForResponsiveStyle,
} from "../responsiveCss"
import { buildComboSelector, styleClassSlug } from "./styleClassSlug"
import type { StyleClassDefinition, StyleClassesRegistry } from "./types"

const selectorForClass = (
  entry: StyleClassDefinition,
  registry: StyleClassesRegistry,
): string | null => {
  if (entry.kind === "combo" && entry.comboMemberIds?.length) {
    return buildComboSelector(entry.comboMemberIds, registry)
  }
  const slug = styleClassSlug(entry.name)
  return slug ? `.${slug}` : null
}

export const buildStyleClassesCss = (registry: StyleClassesRegistry): string => {
  const entries = Object.values(registry)
  if (entries.length === 0) return ""

  const baseRules: string[] = []
  const tabletLandscapeRules: string[] = []
  const tabletRules: string[] = []
  const phoneLandscapeRules: string[] = []
  const phoneRules: string[] = []

  for (const entry of entries) {
    if (entry.kind === "combo") continue
    const selector = selectorForClass(entry, registry)
    if (!selector) continue
    pushRulesForResponsiveStyle(
      selector,
      entry.style,
      baseRules,
      tabletLandscapeRules,
      tabletRules,
      phoneLandscapeRules,
      phoneRules,
    )
  }

  const cssParts: string[] = []
  if (baseRules.length > 0) cssParts.push(baseRules.join(""))
  if (tabletLandscapeRules.length > 0) {
    cssParts.push(`${BRANCH_MEDIA.tabletLandscape}{${tabletLandscapeRules.join("")}}`)
  }
  if (tabletRules.length > 0) {
    cssParts.push(`${BRANCH_MEDIA.tablet}{${tabletRules.join("")}}`)
  }
  if (phoneLandscapeRules.length > 0) {
    cssParts.push(`${BRANCH_MEDIA.phoneLandscape}{${phoneLandscapeRules.join("")}}`)
  }
  if (phoneRules.length > 0) {
    cssParts.push(`${BRANCH_MEDIA.phone}{${phoneRules.join("")}}`)
  }

  return cssParts.join("")
}
