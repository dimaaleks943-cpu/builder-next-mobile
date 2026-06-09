import { createElement } from "react"
import { Element, type NodeTree } from "@craftjs/core"
import { CRAFT_DISPLAY_NAME } from "../../../craft/craftDisplayNames.ts"
import { cloneNodeTree } from "../../../craft/contentListEditorUtils.ts"
import {
  CraftLinkText,
  DEFAULT_LINK_TEXT_CRAFT_PROPS,
} from "../../../craft/LinkText.tsx"
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts"

interface NavbarLinkContainerIds {
  navbarLinksId: string | null
  navbarMenuId: string | null
}

interface CraftQueryLike {
  node: (id: string) => {
    get: () => unknown
    descendants: (deep: boolean) => string[]
  }
  parseReactElement: (element: React.ReactElement) => {
    toNodeTree: () => NodeTree
  }
}

interface CraftActionsLike {
  history: {
    merge: () => {
      addNodeTree: (tree: NodeTree, parentId?: string, index?: number) => void
    }
  }
}

export const findNavbarLinkContainerIds = (
  query: CraftQueryLike,
  navbarNodeId: string,
): NavbarLinkContainerIds => {
  let navbarLinksId: string | null = null
  let navbarMenuId: string | null = null

  try {
    const descendants = query.node(navbarNodeId).descendants(true)
    for (const descendantId of descendants) {
      const node = query.node(descendantId).get()
      const displayName = resolveNodeDisplayName(node)
      if (displayName === CRAFT_DISPLAY_NAME.NavbarLinks && !navbarLinksId) {
        navbarLinksId = descendantId
      } else if (displayName === CRAFT_DISPLAY_NAME.NavbarMenu && !navbarMenuId) {
        navbarMenuId = descendantId
      }
    }
  } catch {
    return { navbarLinksId: null, navbarMenuId: null }
  }

  return { navbarLinksId, navbarMenuId }
}

export const addNavbarLink = (
  actions: CraftActionsLike,
  query: CraftQueryLike,
  navbarNodeId: string,
) => {
  const { navbarLinksId, navbarMenuId } = findNavbarLinkContainerIds(
    query,
    navbarNodeId,
  )
  if (!navbarLinksId || !navbarMenuId) {
    return
  }

  const linkElement = createElement(Element, {
    is: CraftLinkText,
    ...DEFAULT_LINK_TEXT_CRAFT_PROPS,
  })
  const tree = query.parseReactElement(linkElement).toNodeTree()
  const clonedTree = cloneNodeTree(tree, `${navbarNodeId}__link__${Date.now()}`)

  const batched = actions.history.merge()
  batched.addNodeTree(tree, navbarLinksId)
  batched.addNodeTree(clonedTree, navbarMenuId)
}
