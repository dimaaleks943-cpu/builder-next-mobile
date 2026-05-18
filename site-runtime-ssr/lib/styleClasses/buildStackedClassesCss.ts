import {
  BRANCH_MEDIA,
  pushRulesForResponsiveStyle,
  type ResponsiveStyle,
} from "../responsiveCss"
import type { CraftFragmentScopePrefix } from "./fragmentScope"
import { buildComboClassId } from "./comboClassId"
import { buildComboSelector } from "./styleClassSlug"
import { resolveStackedNodeStyle } from "./resolveStackedNodeStyle"
import type { StyleClassesRegistry } from "./types"

const hasStyleBranches = (style: ResponsiveStyle): boolean =>
  Object.values(style).some(
    (branch) =>
      branch &&
      typeof branch === "object" &&
      Object.keys(branch as Record<string, unknown>).length > 0,
  )

const stackDedupeKey = (memberIds: readonly string[]): string =>
  buildComboClassId(memberIds)

/**
 * Compound selectors (`.block-1.block-2`) with full merged cascade.
 * Index 0 in styleClassIds = highest priority among members (matches builder).
 * Higher specificity than single-class rules so stacks win over global `.block-2`.
 */
export const buildStackedClassesCss = (
  stacks: readonly (readonly string[])[],
  registry: StyleClassesRegistry,
  scopePrefix: CraftFragmentScopePrefix,
): string => {
  const seen = new Set<string>()
  const baseRules: string[] = []
  const tabletLandscapeRules: string[] = []
  const tabletRules: string[] = []
  const phoneLandscapeRules: string[] = []
  const phoneRules: string[] = []

  for (const memberIds of stacks) {
    if (memberIds.length < 2) continue
    const key = stackDedupeKey(memberIds)
    if (seen.has(key)) continue
    seen.add(key)

    const style = resolveStackedNodeStyle(memberIds, undefined, registry)
    if (!style || !hasStyleBranches(style)) continue

    const selector = buildComboSelector(memberIds, registry, scopePrefix)
    pushRulesForResponsiveStyle(
      selector,
      style,
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

export const collectStacksFromRegistry = (
  registry: StyleClassesRegistry,
): string[][] =>
  Object.values(registry)
    .filter(
      (entry) =>
        entry.kind === "combo" &&
        Array.isArray(entry.comboMemberIds) &&
        entry.comboMemberIds.length >= 2,
    )
    .map((entry) => [...(entry.comboMemberIds as string[])])
