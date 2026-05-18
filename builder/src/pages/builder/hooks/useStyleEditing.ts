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
import { createStyleClassId, createStyleClassName } from "../styleClasses/styleClassNames.ts"
import type { StyleClassDefinition } from "../styleClasses/types.ts"
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

  const { selectedId, selectedProps, selectedResolvedName, styleClassId } = useEditor(
    (state) => {
      const [id] = Array.from(state.events.selected)
      const node = id ? state.nodes[id] : null
      const props = (node?.data.props ?? {}) as Record<string, unknown>
      return {
        selectedId: id ?? null,
        selectedProps: props,
        selectedResolvedName: node ? resolveNodeDisplayName(node) : "",
        styleClassId: (props.styleClassId as string | undefined) ?? null,
      }
    },
  )

  const activeClass = styleClassId ? classes[styleClassId] : undefined

  const nodeStyleForRead = useMemo(
    () => pickNodeResponsiveStyle(
        styleClassId,
        selectedProps.style as ResponsiveStyle | undefined,
        classes,
      ),
    [styleClassId, selectedProps.style, classes],
  )

  const ensureStyleClass = useCallback((): string | null => {
    if (!selectedId) return null
    if (styleClassId && classes[styleClassId]) return styleClassId

    const existingStyle = (selectedProps.style as ResponsiveStyle | undefined) ?? {}
    const id = createStyleClassId()
    const definition: StyleClassDefinition = {
      id,
      name: createStyleClassName(selectedResolvedName, classes),
      resolvedName: selectedResolvedName,
      style: structuredClone(existingStyle),
    }
    upsertClass(definition)
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      props.styleClassId = id
      delete props.style
    })
    return id
  }, [
    selectedId,
    styleClassId,
    classes,
    selectedProps.style,
    selectedResolvedName,
    upsertClass,
    actions,
  ])

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
      const classId = ensureStyleClass()
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
    [selectedId, ensureStyleClass, setClasses, viewport],
  )

  const mutateClassStyle = useCallback(
    (mutator: (draft: Record<string, unknown>) => void) => {
      if (!selectedId) return
      const classId = ensureStyleClass()
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
    [selectedId, ensureStyleClass, setClasses],
  )

  const assignStyleClass = useCallback(
    (classId: string | null) => {
      if (!selectedId) return
      actions.setProp(selectedId, (props: Record<string, unknown>) => {
        if (classId) {
          props.styleClassId = classId
        } else {
          delete props.styleClassId
        }
        delete props.style
      })
      pruneUnusedClasses()
    },
    [selectedId, actions, pruneUnusedClasses],
  )

  const listClassesForSelected = useCallback(() => {
    return Object.values(classes)
      .filter((c) => c.resolvedName === selectedResolvedName)
      .sort((a, b) => a.name.localeCompare(b.name, "ru"))
  }, [classes, selectedResolvedName])

  const listAllClasses = useCallback(
    () =>
      Object.values(classes).sort((a, b) =>
        a.name.localeCompare(b.name, "ru"),
      ),
    [classes],
  )

  return {
    selectedId,
    selectedProps,
    selectedResolvedName,
    styleClassId,
    activeClass,
    nodeStyleForRead,
    getStyleProp,
    setStyleProp,
    mutateClassStyle,
    assignStyleClass,
    listClassesForSelected,
    listAllClasses,
    countNodesWithClass,
    getNodeResolvedName,
    resolveNodeStyle: (styleClassIdValue?: string | null, localStyle?: ResponsiveStyle,) =>
      resolveResponsiveStyle(
        pickNodeResponsiveStyle(styleClassIdValue, localStyle, classes), viewport),
  }
}
