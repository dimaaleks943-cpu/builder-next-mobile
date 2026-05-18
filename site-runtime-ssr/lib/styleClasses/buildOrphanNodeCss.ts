import type { ResponsiveStyle } from "../responsiveCss"
import { BRANCH_MEDIA, pushRulesForResponsiveStyle } from "../responsiveCss"

export type OrphanStyleNode = {
  nodeId: string
  style: ResponsiveStyle
}

const orphanNodeSelector = (nodeId: string): string =>
  `[data-craft-node-id="${nodeId.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"]`

export const buildOrphanNodeCss = (orphanNodes: OrphanStyleNode[]): string => {
  if (!orphanNodes.length) return ""

  const baseRules: string[] = []
  const tabletLandscapeRules: string[] = []
  const tabletRules: string[] = []
  const phoneLandscapeRules: string[] = []
  const phoneRules: string[] = []

  for (const { nodeId, style } of orphanNodes) {
    pushRulesForResponsiveStyle(
      orphanNodeSelector(nodeId),
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
