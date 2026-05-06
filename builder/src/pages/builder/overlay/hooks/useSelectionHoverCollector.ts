import { useEditor } from "@craftjs/core"
import { useMemo } from "react"
import { resolveNodeDisplayName } from "../../../../utils/resolveNodeDisplayName"
import type { OverlaySelectionData } from "../interface.ts"

export const useSelectionHoverCollector = (): OverlaySelectionData | null => {
  const { selectedId, selectedNode } = useEditor((state) => {
    const [id] = Array.from(state.events.selected)
    return {
      selectedId: id ?? null,
      selectedNode: id ? state.nodes[id] : null,
    }
  })

  return useMemo(() => {
    if (!selectedId || !selectedNode?.dom) {
      return null
    }

    const resolvedName =
      (selectedNode.data?.type as { resolvedName?: string } | undefined)
        ?.resolvedName ?? null

    return {
      nodeId: selectedId,
      dom: selectedNode.dom as HTMLElement,
      label: resolveNodeDisplayName(selectedNode),
      resolvedName,
    }
  }, [selectedId, selectedNode])
}
