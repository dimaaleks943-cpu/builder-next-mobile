import { createElement, type ReactElement } from "react"
import { Element, type NodeTree } from "@craftjs/core"
import {
  CraftLinkText,
  DEFAULT_LINK_TEXT_CRAFT_PROPS,
} from "../../../craft/LinkText.tsx"
import {
  findNavbarLinkContainerIds,
  type CraftQueryLike,
} from "./navbarLinkUtils.ts"

interface AddNavbarLinkQueryLike extends CraftQueryLike {
  parseReactElement: (element: ReactElement) => {
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

export const addNavbarLink = (
  actions: CraftActionsLike,
  query: AddNavbarLinkQueryLike,
  navbarNodeId: string,
) => {
  const { navbarLinksId } = findNavbarLinkContainerIds(query, navbarNodeId)
  if (!navbarLinksId) {
    return
  }

  const linkElement = createElement(Element, {
    is: CraftLinkText,
    ...DEFAULT_LINK_TEXT_CRAFT_PROPS,
  })
  const tree = query.parseReactElement(linkElement).toNodeTree()

  actions.history.merge().addNodeTree(tree, navbarLinksId)
}
