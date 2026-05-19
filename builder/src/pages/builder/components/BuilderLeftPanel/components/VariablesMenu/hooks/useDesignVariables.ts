import { arrayMove } from "@dnd-kit/sortable"
import { useCallback, useEffect, useMemo, useState } from "react"
import type {
  DesignVariable,
  DesignVariableCollection,
} from "../../../../../variables/types.ts"
import { fetchDesignVariablesMock } from "../utils/fetchDesignVariablesMock.ts"
import { getCollectionVariables } from "../utils/collectionVariables.ts"

const sortCollections = (
  collections: DesignVariableCollection[],
): DesignVariableCollection[] =>
  [...collections].sort((a, b) => a.sort - b.sort)

export const useDesignVariables = () => {
  const [collections, setCollections] = useState<DesignVariableCollection[]>([])
  const [variables, setVariables] = useState<DesignVariable[]>([])
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      try {
        const payload = await fetchDesignVariablesMock()
        if (cancelled) return

        const sorted = sortCollections(payload.collections)
        setCollections(sorted)
        setVariables(payload.variables)
        setSelectedCollectionId(sorted[0]?.id ?? null)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const selectedCollection = useMemo(
    () => collections.find((collection) => collection.id === selectedCollectionId),
    [collections, selectedCollectionId],
  )

  const selectedCollectionVariables = useMemo(
    () => getCollectionVariables(selectedCollection, variables),
    [selectedCollection, variables],
  )

  const reorderCollections = useCallback((activeId: string, overId: string) => {
    setCollections((current) => {
      const oldIndex = current.findIndex((item) => item.id === activeId)
      const newIndex = current.findIndex((item) => item.id === overId)
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
        return current
      }

      return arrayMove(current, oldIndex, newIndex).map((item, index) => ({
        ...item,
        sort: index,
      }))
    })
  }, [])

  const renameCollection = useCallback((collectionId: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return

    setCollections((current) =>
      current.map((item) =>
        item.id === collectionId ? { ...item, name: trimmed } : item,
      ),
    )
  }, [])

  const duplicateCollection = useCallback((collectionId: string) => {
    setCollections((current) => {
      const sourceIndex = current.findIndex((item) => item.id === collectionId)
      if (sourceIndex < 0) return current

      const source = current[sourceIndex]
      const duplicate: DesignVariableCollection = {
        ...source,
        id: `col_${Date.now()}`,
        name: `${source.name} (копия)`,
        sort: sourceIndex + 1,
      }

      const next = [...current]
      next.splice(sourceIndex + 1, 0, duplicate)

      return next.map((item, index) => ({
        ...item,
        sort: index,
      }))
    })
  }, [])

  const deleteCollection = useCallback((collectionId: string) => {
    setCollections((current) => {
      if (current.length <= 1) return current

      const next = current
        .filter((item) => item.id !== collectionId)
        .map((item, index) => ({
          ...item,
          sort: index,
        }))

      setSelectedCollectionId((selectedId) => {
        if (selectedId !== collectionId) return selectedId
        return next[0]?.id ?? null
      })

      return next
    })
  }, [])

  const updateColorVariable = useCallback((variableId: string, value: string) => {
    setVariables((current) =>
      current.map((variable) =>
        variable.id === variableId && variable.type === "color"
          ? { ...variable, value }
          : variable,
      ),
    )
  }, [])

  return {
    collections,
    variables,
    selectedCollection,
    selectedCollectionVariables,
    selectedCollectionId,
    isLoading,
    setSelectedCollectionId,
    reorderCollections,
    renameCollection,
    duplicateCollection,
    deleteCollection,
    updateColorVariable,
  }
}
