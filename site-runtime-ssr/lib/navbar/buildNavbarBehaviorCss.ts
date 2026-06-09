import { BRANCH_MEDIA } from "@/lib/responsiveCss"
import type { NavbarBehaviorNode } from "./navbarTypes"

const nodeSelector = (nodeId: string): string =>
  `[data-craft-node-id="${nodeId.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"]`

const hideRule = (nodeId: string): string =>
  `${nodeSelector(nodeId)}{display:none!important}`

const showFlexRule = (nodeId: string): string =>
  `${nodeSelector(nodeId)}{display:flex!important}`

const showInlineFlexRule = (nodeId: string): string =>
  `${nodeSelector(nodeId)}{display:inline-flex!important}`

const buildAlwaysCompactCss = (entry: NavbarBehaviorNode): string => {
  const parts: string[] = [hideRule(entry.linksNodeId)]
  if (entry.menuButtonNodeId) {
    parts.push(showInlineFlexRule(entry.menuButtonNodeId))
  }
  return parts.join("")
}

const buildNeverCompactCss = (entry: NavbarBehaviorNode): string => {
  const parts: string[] = [hideRule(entry.menuNodeId)]
  if (entry.menuButtonNodeId) {
    parts.push(hideRule(entry.menuButtonNodeId))
  }
  return parts.join("")
}

const compactMediaQuery = (maxWidthPx: number): string =>
  maxWidthPx === 1279
    ? BRANCH_MEDIA.tabletLandscape
    : maxWidthPx === 1023
      ? BRANCH_MEDIA.tablet
      : maxWidthPx === 767
        ? BRANCH_MEDIA.phoneLandscape
        : maxWidthPx === 567
          ? BRANCH_MEDIA.phone
          : `@media (max-width: ${maxWidthPx}px)`

const desktopMediaQuery = (maxWidthPx: number): string =>
  `@media (min-width: ${maxWidthPx + 1}px)`

const buildResponsiveCompactCss = (
  entry: NavbarBehaviorNode,
  maxWidthPx: number,
): string => {
  const compactRules: string[] = [hideRule(entry.linksNodeId)]
  if (entry.menuButtonNodeId) {
    compactRules.push(showInlineFlexRule(entry.menuButtonNodeId))
  }

  const desktopRules: string[] = [showFlexRule(entry.linksNodeId)]
  if (entry.menuButtonNodeId) {
    desktopRules.push(hideRule(entry.menuButtonNodeId))
  }
  desktopRules.push(hideRule(entry.menuNodeId))

  return `${desktopMediaQuery(maxWidthPx)}{${desktopRules.join("")}}${compactMediaQuery(maxWidthPx)}{${compactRules.join("")}}`
}

const buildEntryCss = (entry: NavbarBehaviorNode): string => {
  const { menuIconBreakpoint } = entry

  if (menuIconBreakpoint === "none") {
    return buildNeverCompactCss(entry)
  }
  if (menuIconBreakpoint === "desktop") {
    return buildAlwaysCompactCss(entry)
  }

  const maxWidthMap: Record<
    Exclude<NavbarBehaviorNode["menuIconBreakpoint"], "none" | "desktop">,
    number
  > = {
    tablet_landscape: 1279,
    tablet: 1023,
    phone_landscape: 767,
    phone: 567,
  }

  return buildResponsiveCompactCss(
    entry,
    maxWidthMap[menuIconBreakpoint],
  )
}

export const buildNavbarBehaviorCss = (
  entries: readonly NavbarBehaviorNode[],
): string => entries.map(buildEntryCss).join("")
