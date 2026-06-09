import { CRAFT_DISPLAY_NAME } from "../../../craft/craftDisplayNames.ts"
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts"
import type { PreviewViewport } from "../builder.enum.ts"
import { resolveResponsiveStyle, type ResponsiveStyle } from "../responsiveStyle.ts"
import { pickNodeResponsiveStyle } from "../styleClasses/pickNodeResponsiveStyle.ts"
import type { StyleClassesRegistry } from "../styleClasses/types.ts"
import { resolveDesignVariableRefs } from "../variables/resolveDesignVariableRefs.ts"

export const NAVBAR_ROOT_DATA_ATTR = "data-craft-navbar-id"

export interface NavbarCraftProps {
  disableScrollOffsetWhenFixed?: boolean
  style?: ResponsiveStyle
  styleClassIds?: string[]
}

export const getHashFromHref = (href: string): string | null => {
  const trimmed = href.trim()
  if (!trimmed.includes("#")) {
    return null
  }

  const hash = trimmed.slice(trimmed.indexOf("#") + 1)
  return hash.length > 0 ? decodeURIComponent(hash) : null
}

interface NavbarAnchorScrollQuery {
  getNodes: () => Record<string, { data: { props?: unknown } }>
}

export const resolveNavbarScrollOffsetPx = (
  query: NavbarAnchorScrollQuery,
  classes: StyleClassesRegistry,
  viewport: PreviewViewport,
  canvasElement: HTMLElement,
): number | null => {
  let maxOffset = 0
  let found = false

  const nodes = query.getNodes()
  for (const [nodeId, node] of Object.entries(nodes)) {
    if (resolveNodeDisplayName(node) !== CRAFT_DISPLAY_NAME.Navbar) {
      continue
    }

    const props = node.data.props as NavbarCraftProps
    if (props.disableScrollOffsetWhenFixed) {
      continue
    }

    const nodeStyle = pickNodeResponsiveStyle(
      props.styleClassIds ?? [],
      props.style,
      classes,
    )
    const resolved = resolveDesignVariableRefs(
      resolveResponsiveStyle(nodeStyle, viewport),
    )
    const position = String(resolved.position ?? "relative")
    if (position !== "fixed") {
      continue
    }

    const rootEl = canvasElement.querySelector(
      `[${NAVBAR_ROOT_DATA_ATTR}="${nodeId}"]`,
    ) as HTMLElement | null
    if (!rootEl) {
      continue
    }

    found = true
    maxOffset = Math.max(maxOffset, rootEl.getBoundingClientRect().height)
  }

  return found ? maxOffset : null
}

export const scrollElementIntoViewWithOffset = (
  scrollContainer: HTMLElement,
  target: HTMLElement,
  offsetPx: number,
) => {
  const containerRect = scrollContainer.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const top =
    scrollContainer.scrollTop +
    (targetRect.top - containerRect.top) -
    offsetPx

  scrollContainer.scrollTo({
    top: Math.max(0, top),
    behavior: "smooth",
  })
}
