import { useEditor } from "@craftjs/core"
import { useMemo } from "react"
import { resolveNodeDisplayName } from "../../../../utils/resolveNodeDisplayName"
import { resolveCraftDomElement } from "../resolveCraftDomElement.ts"
import type { OverlayHoverData } from "../interface.ts"

export const useHoverOverlayCollector = (): OverlayHoverData | null => {
  const { hoveredId, hoveredNode } = useEditor((state, query) => {
    const [id] = Array.from(state.events.hovered)
    if (!id) {
      return { hoveredId: null, hoveredNode: null }
    }
    if (query.node(id).isRoot()) {
      return { hoveredId: null, hoveredNode: null }
    }
    return {
      hoveredId: id,
      hoveredNode: state.nodes[id] ?? null,
    }
  })

  return useMemo(() => {
    if (!hoveredId || !hoveredNode) {
      return null
    }
    const dom = resolveCraftDomElement(hoveredNode.dom)
    if (!dom) {
      return null
    }

    return {
      nodeId: hoveredId,
      dom,
      label: resolveNodeDisplayName(hoveredNode),
    }
  }, [hoveredId, hoveredNode])
}
