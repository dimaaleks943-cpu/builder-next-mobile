import { CRAFT_DISPLAY_NAME } from "../../../craft/craftDisplayNames.ts"
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts"

export interface NavbarLinkContainerIds {
  navbarLinksId: string | null
  navbarMenuId: string | null
}

export interface CraftQueryLike {
  node: (id: string) => {
    get: () => unknown
    descendants: (deep: boolean) => string[]
    ancestors: (deep: boolean) => string[]
  }
}

export const findNavbarAncestorId = (
  query: CraftQueryLike,
  nodeId: string,
): string | null => {
  try {
    const ancestors = query.node(nodeId).ancestors(true) as string[]
    for (const ancestorId of ancestors) {
      const ancestorNode = query.node(ancestorId).get()
      if (resolveNodeDisplayName(ancestorNode) === CRAFT_DISPLAY_NAME.Navbar) {
        return ancestorId
      }
    }
  } catch {
    return null
  }
  return null
}

export const findNavbarLinkContainerIds = (
  query: CraftQueryLike,
  navbarNodeId: string,
): NavbarLinkContainerIds => {
  let navbarLinksId: string | null = null
  let navbarMenuId: string | null = null

  try {
    const navbarNode = query.node(navbarNodeId).get() as {
      data?: { nodes?: string[] }
    }
    const childIds = navbarNode?.data?.nodes ?? []
    for (const childId of childIds) {
      const node = query.node(childId).get()
      const displayName = resolveNodeDisplayName(node)
      if (displayName === CRAFT_DISPLAY_NAME.NavbarLinks) {
        navbarLinksId = childId
      } else if (displayName === CRAFT_DISPLAY_NAME.NavbarMenu) {
        navbarMenuId = childId
      }
    }
  } catch {
    return { navbarLinksId: null, navbarMenuId: null }
  }

  return { navbarLinksId, navbarMenuId }
}

export const getNavbarLinkTextChildIds = (
  query: CraftQueryLike,
  navbarLinksId: string,
): string[] => {
  try {
    const linksNode = query.node(navbarLinksId).get() as {
      data?: { nodes?: string[] }
    }
    const childIds = linksNode?.data?.nodes ?? []
    return childIds.filter((childId) => {
      const childNode = query.node(childId).get()
      return resolveNodeDisplayName(childNode) === CRAFT_DISPLAY_NAME.LinkText
    })
  } catch {
    return []
  }
}
