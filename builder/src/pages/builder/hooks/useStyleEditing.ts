import { useCallback, useMemo } from "react"
import { useEditor } from "@craftjs/core"
import { usePreviewViewport } from "../context/PreviewViewportContext.tsx"
import { useStyleClassContext } from "../context/StyleClassContext.tsx"
import {
  getResponsiveStyleProp,
  resolveResponsiveStyle,
  setResponsiveStyleProp,
  type ResponsiveStyle,
} from "../responsiveStyle.ts"
import type { PreviewViewport } from "../builder.enum.ts"
import { pickNodeResponsiveStyle } from "../styleClasses/pickNodeResponsiveStyle.ts"
import { buildComboClassId } from "../styleClasses/comboClassId.ts"
import { buildComboClassLabel } from "../styleClasses/styleClassSlug.ts"
import { duplicateStyleClass } from "../styleClasses/duplicateStyleClass.ts"
import { normalizeStyleClassIds } from "../styleClasses/styleClassIds.ts"
import { createStyleClassId, createStyleClassName } from "../styleClasses/styleClassNames.ts"
import type {
  StyleClassDefinition,
  StyleClassesRegistry,
} from "../styleClasses/types.ts"
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts"

export const useStyleEditing = () => {
  const viewport = usePreviewViewport()
  const { actions } = useEditor()
  const {
    classes,
    upsertClass,
    setClasses,
    pruneUnusedClasses,
    countNodesWithClass,
    getNodeResolvedName,
  } = useStyleClassContext()

  const { selectedId, selectedProps, selectedResolvedName, styleClassIds } = useEditor(
    (state) => {
      const [id] = Array.from(state.events.selected)
      const node = id ? state.nodes[id] : null
      const props = (node?.data.props ?? {}) as Record<string, unknown>
      return {
        selectedId: id ?? null,
        selectedProps: props,
        selectedResolvedName: node ? resolveNodeDisplayName(node) : "",
        styleClassIds: normalizeStyleClassIds(props.styleClassIds),
      }
    },
  )

  const nodeStyleForRead = useMemo(
    () =>
      pickNodeResponsiveStyle(
        styleClassIds,
        selectedProps.style as ResponsiveStyle | undefined,
        classes,
      ),
    [styleClassIds, selectedProps.style, classes],
  )

  const ensureFirstStyleClass = useCallback((): string | null => {
    if (!selectedId) return null
    if (styleClassIds.length > 0 && classes[styleClassIds[0]]) {
      return styleClassIds[0]
    }

    const existingStyle = (selectedProps.style as ResponsiveStyle | undefined) ?? {}
    const id = createStyleClassId()
    const definition: StyleClassDefinition = {
      id,
      name: createStyleClassName(selectedResolvedName, classes),
      resolvedName: selectedResolvedName,
      kind: "base",
      style: structuredClone(existingStyle),
    }
    upsertClass(definition)
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      props.styleClassIds = [id]
      delete props.style
    })
    return id
  }, [
    selectedId,
    styleClassIds,
    classes,
    selectedProps.style,
    selectedResolvedName,
    upsertClass,
    actions,
  ])

  const ensureComboClass = useCallback((): string | null => {
    if (!selectedId || styleClassIds.length < 2) return null
    const comboId = buildComboClassId(styleClassIds)
    if (classes[comboId]) return comboId

    const definition: StyleClassDefinition = {
      id: comboId,
      name: buildComboClassLabel(styleClassIds, classes),
      resolvedName: selectedResolvedName,
      kind: "combo",
      comboMemberIds: [...styleClassIds],
      style: {},
    }
    upsertClass(definition)
    return comboId
  }, [selectedId, styleClassIds, classes, selectedResolvedName, upsertClass])

  const ensureEditTargetClassId = useCallback((): string | null => {
    if (!selectedId) return null
    if (styleClassIds.length === 0) return ensureFirstStyleClass()
    if (styleClassIds.length === 1) return styleClassIds[0]
    return ensureComboClass()
  }, [selectedId, styleClassIds, ensureFirstStyleClass, ensureComboClass])

  const getStyleProp = useCallback(
    (key: string, vp: PreviewViewport = viewport) =>
      getResponsiveStyleProp(
        { style: nodeStyleForRead } as Record<string, unknown>,
        key,
        vp,
      ),
    [nodeStyleForRead, viewport],
  )

  const setStyleProp = useCallback(
    (key: string, value: unknown, vp: PreviewViewport = viewport) => {
      if (!selectedId) return
      const classId = ensureEditTargetClassId()
      if (!classId) return

      setClasses((prev) => {
        const current = prev[classId]
        if (!current) return prev
        const nextProps = { style: structuredClone(current.style) } as Record<
          string,
          unknown
        >
        setResponsiveStyleProp(nextProps, key, value, vp)
        return {
          ...prev,
          [classId]: {
            ...current,
            style: nextProps.style as ResponsiveStyle,
          },
        }
      })
    },
    [selectedId, ensureEditTargetClassId, setClasses, viewport],
  )

  const mutateClassStyle = useCallback(
    (mutator: (draft: Record<string, unknown>) => void) => {
      if (!selectedId) return
      const classId = ensureEditTargetClassId()
      if (!classId) return
      setClasses((prev) => {
        const current = prev[classId]
        if (!current) return prev
        const draft = { style: structuredClone(current.style) } as Record<
          string,
          unknown
        >
        mutator(draft)
        return {
          ...prev,
          [classId]: {
            ...current,
            style: draft.style as ResponsiveStyle,
          },
        }
      })
    },
    [selectedId, ensureEditTargetClassId, setClasses],
  )

  const setStyleClassIdsOnNode = useCallback(
    (nextIds: string[]) => {
      if (!selectedId) return
      actions.setProp(selectedId, (props: Record<string, unknown>) => {
        if (nextIds.length > 0) {
          props.styleClassIds = nextIds
        } else {
          delete props.styleClassIds
        }
        delete props.style
      })
      pruneUnusedClasses()
    },
    [selectedId, actions, pruneUnusedClasses],
  )

  const appendStyleClass = useCallback(
    (classId: string) => {
      if (!selectedId || !classId) return
      const next = styleClassIds.includes(classId)
        ? styleClassIds
        : [...styleClassIds, classId]
      setStyleClassIdsOnNode(next)
    },
    [selectedId, styleClassIds, setStyleClassIdsOnNode],
  )

  const clearStyleClasses = useCallback(() => {
    setStyleClassIdsOnNode([])
  }, [setStyleClassIdsOnNode])

  const removeLastStyleClass = useCallback(() => {
    if (styleClassIds.length === 0) return
    setStyleClassIdsOnNode(styleClassIds.slice(0, -1))
  }, [styleClassIds, setStyleClassIdsOnNode])

  const replaceStyleClassAt = useCallback(
    (index: number, newClassId: string) => {
      if (!selectedId || index < 0 || index >= styleClassIds.length) return
      const next = [...styleClassIds]
      next[index] = newClassId
      setStyleClassIdsOnNode(next)
    },
    [selectedId, styleClassIds, setStyleClassIdsOnNode],
  )

  const renameStyleClassOnElement = useCallback(
    (index: number, newName: string) => {
      const trimmed = newName.trim()
      if (!trimmed || index < 0 || index >= styleClassIds.length) return
      const classId = styleClassIds[index]
      const source = classes[classId]
      if (!source || source.kind === "combo") return
      if (trimmed === source.name) return

      setClasses((prev) => {
        const next: StyleClassesRegistry = {
          ...prev,
          [classId]: { ...source, name: trimmed },
        }
        for (const [id, def] of Object.entries(next)) {
          if (def.kind === "combo" && def.comboMemberIds?.includes(classId)) {
            next[id] = {
              ...def,
              name: buildComboClassLabel(def.comboMemberIds, next),
            }
          }
        }
        return next
      })
    },
    [styleClassIds, classes, setClasses],
  )

  const copyStyleClassOnElement = useCallback(
    (index: number) => {
      if (index < 0 || index >= styleClassIds.length) return
      const source = classes[styleClassIds[index]]
      if (!source) return
      const definition = duplicateStyleClass(source, classes)
      upsertClass(definition)
      replaceStyleClassAt(index, definition.id)
    },
    [styleClassIds, classes, upsertClass, replaceStyleClassAt],
  )

  const listClassesForSelected = useCallback(() => {
    return Object.values(classes)
      .filter((c) => c.kind !== "combo" && c.resolvedName === selectedResolvedName)
      .sort((a, b) => a.name.localeCompare(b.name, "ru"))
  }, [classes, selectedResolvedName])

  const listAllClasses = useCallback(
    () =>
      Object.values(classes)
        .filter((c) => c.kind !== "combo")
        .sort((a, b) => a.name.localeCompare(b.name, "ru")),
    [classes],
  )

  const styleClassPills = useMemo(
    () =>
      styleClassIds.map((id) => ({
        id,
        name: classes[id]?.name ?? id,
      })),
    [styleClassIds, classes],
  )

  return {
    selectedId,
    selectedProps,
    selectedResolvedName,
    styleClassIds,
    styleClassPills,
    nodeStyleForRead,
    getStyleProp,
    setStyleProp,
    mutateClassStyle,
    appendStyleClass,
    clearStyleClasses,
    removeLastStyleClass,
    renameStyleClassOnElement,
    copyStyleClassOnElement,
    listClassesForSelected,
    listAllClasses,
    countNodesWithClass,
    getNodeResolvedName,
    resolveNodeStyle: (
      styleClassIdsValue?: string[] | null,
      localStyle?: ResponsiveStyle,
    ) =>
      resolveResponsiveStyle(
        pickNodeResponsiveStyle(styleClassIdsValue ?? [], localStyle, classes),
        viewport,
      ),
  }
}
