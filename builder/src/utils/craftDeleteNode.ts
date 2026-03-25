import type { SerializedNodes } from "@craftjs/core"
import { removeSerializedSubtree } from "./removeSerializedSubtree.ts"

type CraftQuery = {
  node: (id: string) => {
    isRoot: () => boolean
    isDeletable: () => boolean
    isLinkedNode: () => boolean
  }
  getSerializedNodes: () => SerializedNodes
  getState: () => { nodes: Record<string, unknown> }
}

type CraftActions = {
  delete: (id: string) => void
  deserialize: (input: SerializedNodes | string) => void
}

/**
 * Удаление узла в редакторе Craft.js.
 * - Linked canvas (ContentListCell): `isDeletable()` false — только через serialize/deserialize.
 * - Битые ссылки в графе (часто у ContentList после compact/seed): `actions.delete` падает
 *   внутри Craft при обходе детей — тот же fallback.
 */
export const deleteCraftNode = (actions: CraftActions, query: CraftQuery, id: string): void => {
  if (!id) return
  if (query.node(id).isRoot()) return

  const deleteViaSerialized = () => {
    const next = removeSerializedSubtree(query.getSerializedNodes(), id)
    actions.deserialize(next)
  }

  if (!query.node(id).isDeletable()) {
    deleteViaSerialized()
    return
  }
  try {
    actions.delete(id)
  } catch {
    deleteViaSerialized()
  }
}
