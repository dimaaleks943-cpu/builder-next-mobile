import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import { useEditor } from "@craftjs/core"
import type { StyleClassesRegistry, StyleClassDefinition } from "../styleClasses/types.ts"
import { pruneUnusedStyleClasses } from "../styleClasses/pruneUnusedStyleClasses.ts"
import { normalizeStyleClassIds } from "../styleClasses/styleClassIds.ts"
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts"

type StyleClassContextValue = {
  classes: StyleClassesRegistry
  setClasses: (updater: (prev: StyleClassesRegistry) => StyleClassesRegistry) => void
  upsertClass: (definition: StyleClassDefinition) => void
  pruneUnusedClasses: () => void
  countNodesWithClass: (classId: string) => number
  getNodeResolvedName: (nodeId: string) => string
}

const StyleClassContext = createContext<StyleClassContextValue | null>(null)

interface Props {
  children: ReactNode
  classes: StyleClassesRegistry
  setClasses: (updater: (prev: StyleClassesRegistry) => StyleClassesRegistry) => void
}

export const StyleClassProvider = ({ children, classes, setClasses }: Props) => {
  const { query } = useEditor()

  const upsertClass = useCallback(
    (definition: StyleClassDefinition) => {
      setClasses((prev) => ({
        ...prev,
        [definition.id]: definition,
      }))
    },
    [setClasses],
  )

  const pruneUnusedClasses = useCallback(() => {
    const nodes = query.getSerializedNodes()
    setClasses((prev) => pruneUnusedStyleClasses(prev, nodes))
  }, [query, setClasses])

  const countNodesWithClass = useCallback(
    (classId: string) => {
      const nodes = query.getSerializedNodes()
      return Object.entries(nodes).filter(([nodeId, node]) => {
        if (nodeId === "ROOT") return false
        const props = node.props as Record<string, unknown> | undefined

        return normalizeStyleClassIds(props?.styleClassIds).includes(classId)
      }).length
    },
    [query],
  )

  const getNodeResolvedName = useCallback(
    (nodeId: string) => {
      const node = query.node(nodeId).get()
      return resolveNodeDisplayName(node)
    },
    [query],
  )

  const value = useMemo(
    () => ({
      classes,
      setClasses,
      upsertClass,
      pruneUnusedClasses,
      countNodesWithClass,
      getNodeResolvedName,
    }),
    [
      classes,
      setClasses,
      upsertClass,
      pruneUnusedClasses,
      countNodesWithClass,
      getNodeResolvedName,
    ],
  )

  return (
    <StyleClassContext.Provider value={value}>{children}</StyleClassContext.Provider>
  )
}

export const useStyleClassContext = () => {
  const ctx = useContext(StyleClassContext)
  if (!ctx) {
    throw new Error("useStyleClassContext must be used within StyleClassProvider")
  }
  return ctx
}
