import { useNode, useEditor, Element } from "@craftjs/core"
import { useState, useEffect, useRef, startTransition } from "react"
import { useLazyGetContentItemsQuery } from "../store/extranetApi"
import { isExtranetContentTypeId } from "../utils/contentFieldValue"
import { COLORS } from "../theme/colors"
import { useRightPanelContext } from "../pages/builder/context/RightPanelContext.tsx"
import { useCollectionsContext } from "../pages/builder/context/CollectionsContext.tsx"
import { CraftContentListCell } from "./ContentListCell"
import { ContentListDataContext } from "../pages/builder/context/ContentListDataContext.tsx"
import { InlineSettingsModal } from "../components/InlineSettingsModal.tsx"
import { InlineSettingsBadge } from "../components/InlineSettingsBadge.tsx"

/** Клонирует дерево узлов с новыми id, чтобы не было дубликатов ключей при добавлении в несколько ячеек.
 *  Типы здесь намеренно ослаблены до any, чтобы не тянуть внутрь все внутренние типы Craft.js (NodeTree/Nodes).
 */
const cloneNodeTree = (tree: any, idPrefix: string): any => {
  const idMap: Record<string, string> = {}
  for (const oldId of Object.keys(tree.nodes as Record<string, any>)) {
    idMap[oldId] = `${idPrefix}_${oldId}`
  }
  const newNodes: Record<string, any> = {}
  for (const [oldId, node] of Object.entries(tree.nodes as Record<string, any>)) {
    const newId = idMap[oldId]
    const data: any = { ...(node as any).data }
    data.parent = data.parent && idMap[data.parent as string] ? idMap[data.parent as string] : null
    data.nodes = ((data.nodes as string[]) ?? []).map((n) => idMap[n] ?? n)
    if (data.linkedNodes && typeof data.linkedNodes === "object") {
      const linked = data.linkedNodes as Record<string, string>
      data.linkedNodes = Object.fromEntries(
        Object.entries(linked).map(([k, v]) => [k, idMap[v] ?? v]),
      )
    }
    if (data._childCanvas && typeof data._childCanvas === "object") {
      const childCanvas = data._childCanvas as Record<string, string>
      data._childCanvas = Object.fromEntries(
        Object.entries(childCanvas).map(([k, v]) => [k, idMap[v] ?? v]),
      )
    }
    newNodes[newId] = { ...(node as any), id: newId, data }
  }
  return {
    rootNodeId: idMap[tree.rootNodeId],
    nodes: newNodes,
  }
}

const CELL_IDS_PENDING = { cellIds: [] as string[], signature: "__pending__" } as const

/** Собирает id, type и props узлов поддерева в порядке depth-first (узел, затем дети) */
const getDescendantsWithProps = (
  query: {
    node: (id: string) => { get: () => { data: { nodes?: string[]; type: unknown; props: Record<string, unknown> } } }
  },
  nodeId: string,
): { id: string; type: unknown; props: Record<string, unknown> }[] => {
  const result: { id: string; type: unknown; props: Record<string, unknown> }[] = []
  try {
    const node = query.node(nodeId).get()
    const type = node.data.type
    const props = { ...(node.data.props || {}) }
    result.push({ id: nodeId, type, props })
    const childIds: string[] = (node.data.nodes ?? []) as string[]
    for (const cid of childIds) {
      result.push(...getDescendantsWithProps(query, cid))
    }
  } catch {
    // skip invalid node
  }
  return result
}

// Проверяет, что типы узлов совпадают (в том числе по resolvedName у Craft-компонентов),
// чтобы можно было безопасно обновлять только props при "мягкой" синхронизации без пересоздания узлов
const typesMatch = (a: unknown, b: unknown): boolean => {
  if (a === b) return true
  if (typeof a === "object" && a && typeof b === "object" && b) {
    const ar = (a as { resolvedName?: string }).resolvedName
    const br = (b as { resolvedName?: string }).resolvedName
    if (ar !== undefined && br !== undefined) return ar === br
  }
  return false
}

export type ContentListProps = {
  selectedSource?: string
  itemsPerRow?: number
}

/**
 * Список контента (коллекция) с шаблоном ячеек и синхронизацией.
 * Известное предупреждение React: "Cannot update ContentList while rendering ke" —
 * возникает при выборе коллекции в селекте из-за подписки useEditor на стор Craft.js
 * при монтировании дочерних ячеек. На работу не влияет, можно игнорировать.
 */
export const CraftContentList = ({}: ContentListProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
  const badgeRef = useRef<HTMLDivElement | null>(null)
  const syncInProgressRef = useRef(false)
  const prevSignaturePartsRef = useRef<string[]>([])

  const {
    connectors: { connect, drag },
    selected,
    id: contentListId,
    props,
  } = useNode((node) => ({
    selected: node.events.selected,
    id: node.id,
    props: node.data.props as ContentListProps,
  }))

  const { actions, query } = useEditor()

  const rightPanelContext = useRightPanelContext()
  const collectionsContext = useCollectionsContext()
  const [fetchContentItems] = useLazyGetContentItemsQuery()

  const openSettings = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect()
      setModalPosition({
        top: rect.bottom + 6,
        left: rect.left,
      })
    }
    setIsSettingsOpen(true)
  }

  const handleShowAllSettings = () => {
    rightPanelContext?.setTabIndex(1) // вкладка "Настройки"
    setIsSettingsOpen(false)
  }

  // Текущий выбранный source и layout берём из props узла Craft.js,
  // чтобы настройки сохранялись в JSON и восстанавливались при загрузке
  const selectedSource = props.selectedSource ?? ""
  const itemsPerRow = props.itemsPerRow ?? 1

  /** Чтобы не зациклить запрос при пустом ответе или ошибке. */
  const itemsFetchCompletedRef = useRef<Set<string>>(new Set()) //TODO надо?

  // Массив элементов активной коллекции (items выбранного source),
  // уже "разрешённый" из CollectionsContext по selectedSource
  const resolvedItems: any[] =
    selectedSource && collectionsContext
      ? collectionsContext.collections.find((c) => c.key === selectedSource)?.items ?? []
      : []

  useEffect(() => {
    if (!selectedSource || !collectionsContext?.setCollectionItems) return
    if (!isExtranetContentTypeId(selectedSource)) return

    const collection = collectionsContext.collections.find(
      (c) => c.key === selectedSource,
    )
    if (!collection) return
    if (collection.items.length > 0) return
    if (itemsFetchCompletedRef.current.has(selectedSource)) return
    let cancelled = false
    void (async () => {
      try {
        const res = await fetchContentItems({
          contentTypeId: selectedSource,
        }).unwrap()
        if (cancelled) return
        itemsFetchCompletedRef.current.add(selectedSource)
        collectionsContext.setCollectionItems(selectedSource, res?.data ?? [])
      } catch {
        if (cancelled) return
        itemsFetchCompletedRef.current.add(selectedSource)
        collectionsContext.setCollectionItems(selectedSource, [])
      }
    })()

    return () => {
      cancelled = true
    }
  }, [selectedSource, collectionsContext])

  const hasCollection = resolvedItems.length > 0
  const cellCount = hasCollection ? resolvedItems.length : 0

  // Для текущего ContentList собираем:
  // 1) фактические id всех ячеек (cellIds)
  // 2) "подпись" структуры каждой ячейки (signature), чтобы отслеживать изменения шаблона
  const cellIdsAndSignature = useEditor((state, q) => {
    if (!contentListId || !state.nodes[contentListId] || cellCount === 0) return {
      cellIds: [] as string[],
      signature: ""
    }
    try {
      const contentListNode = state.nodes[contentListId]
      const linkedNodes = (contentListNode?.data?.linkedNodes ?? {}) as Record<string, string>
      const dataNodes = (contentListNode?.data?.nodes ?? []) as string[]
      const cellIds: string[] = []
      for (let i = 0; i < cellCount; i++) {
        const linkKey = `${contentListId}-cell-${i}`
        const actualId = linkedNodes[linkKey] ?? dataNodes[i]
        if (actualId && state.nodes[actualId]) cellIds.push(actualId)
      }
      if (cellIds.length < cellCount) return CELL_IDS_PENDING
      const serialized = q.getSerializedNodes()
      const parts: string[] = []
      for (const cellId of cellIds) {
        try {
          if (!state.nodes[cellId]) {
            parts.push("")
            continue
          }
          const descendantIds = q.node(cellId).descendants(true)
          const allIds = [cellId, ...descendantIds]
          const fingerprint = allIds
            .map((id) => {
              const n = serialized[id]
              if (!n) return ""
              return JSON.stringify({ type: n.type, props: n.props })
            })
            .join(";")
          parts.push(fingerprint)
        } catch {
          parts.push("")
        }
      }
      return { cellIds, signature: parts.join("||") }
    } catch {
      return { cellIds: [] as string[], signature: "" }
    }
  })

  // Строка-подпись, описывающая структуру и props всех ячеек (каждой отдельно и всех вместе)
  const anyCellTemplateSignature = cellIdsAndSignature.signature
  // Массив фактических id ячеек ContentList в сторе Craft.js
  const actualCellIds = cellIdsAndSignature.cellIds

  // Следит за изменением "подписи" ячеек и, если одна из ячеек изменилась,
  // синхронизирует её содержимое (структуру/props) во все остальные ячейки списка
  useEffect(() => {
    if (!hasCollection || actualCellIds.length <= 1 || syncInProgressRef.current) return
    if (anyCellTemplateSignature === "__pending__" || anyCellTemplateSignature === "") return

    const runSync = () => {
      if (syncInProgressRef.current) return
      const currentParts = anyCellTemplateSignature.split("||")
      const prevParts = prevSignaturePartsRef.current

      let sourceCellIndex = -1
      for (let i = 0; i < currentParts.length; i++) {
        if (currentParts[i] !== prevParts[i]) {
          sourceCellIndex = i
          break
        }
      }
      if (sourceCellIndex < 0) {
        prevSignaturePartsRef.current = currentParts
        return
      }

      const sourceCellId = actualCellIds[sourceCellIndex]
      if (!sourceCellId) {
        prevSignaturePartsRef.current = currentParts
        return
      }
      let sourceNodesList: { id: string; type: unknown; props: Record<string, unknown> }[] = []
      try {
        sourceNodesList = getDescendantsWithProps(query, sourceCellId)
      } catch {
        prevSignaturePartsRef.current = currentParts
        return
      }
      if (sourceNodesList.length === 0) {
        prevSignaturePartsRef.current = currentParts
        return
      }

      // Для «жёсткой» синхронизации (переклонирование дерева) нам всё ещё нужны прямые дети ячейки
      let sourceChildIds: string[] = []
      try {
        const node = query.node(sourceCellId).get()
        sourceChildIds = (node?.data?.nodes as string[]) ?? []
      } catch {
        // игнорируем, жёсткая синхронизация просто ничего не сделает
      }

      syncInProgressRef.current = true
      try {
        const batched = actions.history.merge()
        let useSoftSync = true
        for (let i = 0; i < actualCellIds.length; i++) {
          if (i === sourceCellIndex) continue
          const targetCellId = actualCellIds[i]
          let targetNodesList: { id: string; type: unknown; props: Record<string, unknown> }[] = []
          try {
            targetNodesList = getDescendantsWithProps(query, targetCellId)
          } catch {
            useSoftSync = false
            break
          }
          if (targetNodesList.length !== sourceNodesList.length) {
            useSoftSync = false
            break
          }
          for (let k = 0; k < sourceNodesList.length; k++) {
            if (!typesMatch(sourceNodesList[k].type, targetNodesList[k].type)) {
              useSoftSync = false
              break
            }
          }
          if (!useSoftSync) break
        }

        if (useSoftSync) {
          for (let i = 0; i < actualCellIds.length; i++) {
            if (i === sourceCellIndex) continue
            const targetCellId = actualCellIds[i]
            let targetNodesList: { id: string; type: unknown; props: Record<string, unknown> }[] = []
            try {
              targetNodesList = getDescendantsWithProps(query, targetCellId)
            } catch {
              continue
            }
            for (let k = 0; k < sourceNodesList.length && k < targetNodesList.length; k++) {
              try {
                batched.setProp(targetNodesList[k].id, (props: Record<string, unknown>) => {
                  Object.assign(props, sourceNodesList[k].props)
                })
              } catch {
                // skip
              }
            }
          }
        } else {
          // дерево узлов Craft.js (типы ослаблены до any выше в cloneNodeTree)
          const trees: any[] = []
          for (const cid of sourceChildIds) {
            try {
              const tree = query.node(cid).toNodeTree("childNodes")
              trees.push(tree)
            } catch {
              // skip invalid node
            }
          }
          if (trees.length === 0) {
            prevSignaturePartsRef.current = anyCellTemplateSignature.split("||")
            return
          }
          for (let i = 0; i < actualCellIds.length; i++) {
            if (i === sourceCellIndex) continue
            const targetCellId = actualCellIds[i]
            let targetNode
            try {
              targetNode = query.node(targetCellId).get()
            } catch {
              continue
            }
            if (!targetNode) continue
            const targetChildIds: string[] = (targetNode.data?.nodes as string[]) ?? []
            for (const childId of targetChildIds) {
              try {
                batched.delete(childId)
              } catch {
                // node may already be removed
              }
            }
            for (const tree of trees) {
              const cloned = cloneNodeTree(tree, targetCellId)
              batched.addNodeTree(cloned, targetCellId)
            }
          }
        }
        prevSignaturePartsRef.current = anyCellTemplateSignature.split("||")
      } finally {
        syncInProgressRef.current = false
      }
    }

    const t = setTimeout(runSync, 0)
    return () => clearTimeout(t)
  }, [anyCellTemplateSignature, query, actions])

  return (
    <div
      ref={(ref) => {
        if (!ref) return
        connect(drag(ref))
      }}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: selected ? COLORS.lightPurple : COLORS.white,
        border: selected
          ? `2px solid ${COLORS.purple400}`
          : `1px solid ${COLORS.gray300}`,
        borderRadius: 4,
        overflow: "visible",
        position: "relative",
      }}
    >
      {selected && (
        <InlineSettingsBadge
          ref={badgeRef}
          icon={<span>CL</span>}
          label="ContentList"
          onSettingsClick={openSettings}
        />
      )}

      {/* Основная область: либо 3 плейсхолдера, либо реальные элементы коллекции */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: 300,
        }}
      >
        {hasCollection
          ? (() => {
            const rows: any[][] = []
            for (let i = 0; i < resolvedItems.length; i += itemsPerRow) {
              rows.push(resolvedItems.slice(i, i + itemsPerRow))
            }

            return rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                style={{
                  display: "flex",
                  flexDirection: itemsPerRow === 1 ? "column" : "row",
                  borderBottom:
                    rowIndex === rows.length - 1
                      ? "none"
                      : "1px dashed rgba(108, 93, 211, 0.3)",
                }}
              >
                {row.map((_, itemIndex) => {
                  const flatIndex = rowIndex * itemsPerRow + itemIndex
                  const cellId = `${contentListId}-cell-${flatIndex}`
                  const itemData = resolvedItems[flatIndex] || null
                  return (
                    <ContentListDataContext.Provider
                      key={flatIndex}
                      value={{
                        collectionKey: selectedSource || null,
                        itemData: itemData,
                      }}
                    >
                      <div
                        style={{
                          flex: itemsPerRow === 1 ? "none" : 1,
                          position: "relative",
                          display: "flex",
                          borderRight:
                            itemsPerRow > 1 && itemIndex < row.length - 1
                              ? "1px dashed rgba(108, 93, 211, 0.3)"
                              : "none",
                        }}
                      >
                        <Element
                          is={CraftContentListCell}
                          id={cellId}
                          canvas
                        />
                      </div>
                    </ContentListDataContext.Provider>
                  )
                })}
              </div>
            ))
          })()
          : (
            <>
              {/* Строка 1 плейсхолдер */}
              <div
                style={{
                  flex: 1,
                  padding: "16px",
                  borderBottom: "1px dashed rgba(108, 93, 211, 0.3)",
                  position: "relative",
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    color: COLORS.gray700,
                    fontSize: 14,
                  }}
                >
                  Collection item 1
                </span>
              </div>

              {/* Строка 2 с CTA для подключения коллекции */}
              <div
                style={{
                  flex: 1,
                  padding: "16px",
                  borderBottom: "1px dashed rgba(108, 93, 211, 0.3)",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <button
                  style={{
                    padding: "8px 16px",
                    backgroundColor: COLORS.purple400,
                    color: COLORS.white,
                    border: "none",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                  onClick={openSettings}
                >
                  Double click to connect to a collection
                </button>
              </div>

              {/* Строка 3 плейсхолдер */}
              <div
                style={{
                  flex: 1,
                  padding: "16px",
                  position: "relative",
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    color: COLORS.gray700,
                    fontSize: 14,
                  }}
                >
                  Collection item 3
                </span>
              </div>
            </>
          )}
      </div>

      {/* Небольшое окно настроек коллекции, отображается рядом с биркой */}
      <InlineSettingsModal
        open={isSettingsOpen}
        title="Настройки списка контента"
        top={modalPosition.top}
        left={modalPosition.left}
        onClose={() => setIsSettingsOpen(false)}
        onShowAllSettings={handleShowAllSettings}
      >
        <label
          style={{
            display: "block",
            marginBottom: 4,
            fontSize: 12,
            color: COLORS.gray700,
          }}
        >
          Source
        </label>
        <select
          style={{
            width: "100%",
            padding: "6px 8px",
            fontSize: 13,
            borderRadius: 4,
            border: `1px solid ${COLORS.gray300}`,
            marginBottom: selectedSource ? 12 : 8,
          }}
          value={selectedSource}
          onChange={(e) => {
            const value = e.target.value
            startTransition(() => {
              actions.setProp(contentListId, (nodeProps: ContentListProps) => {
                nodeProps.selectedSource = value
                if (!value) {
                  nodeProps.itemsPerRow = 1 // сбрасываем layout при отключении коллекции
                }
              })
            })
          }}
        >
          <option value="">None</option>
          {collectionsContext?.collections.map((collection) => (
            <option key={collection.key} value={collection.key}>
              {collection.label}
            </option>
          ))}
        </select>

        {selectedSource && !isExtranetContentTypeId(selectedSource) && (
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              color: COLORS.gray600,
            }}
          >
            This source is no longer available. Rebind the list to a content type from extranet.
          </div>
        )}

        {selectedSource ? (
          <div
            style={{
              marginTop: 8,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: COLORS.gray800,
                marginBottom: 8,
              }}
            >
              Layout
            </div>
            <div
              style={{
                display: "flex",
                gap: 4,
                backgroundColor: COLORS.gray100,
                padding: 4,
                borderRadius: 4,
              }}
            >
              {[1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    actions.setProp(contentListId, (nodeProps: ContentListProps) => {
                      nodeProps.itemsPerRow = count
                    })
                  }}
                  style={{
                    flex: 1,
                    padding: "6px 4px",
                    border: "none",
                    borderRadius: 4,
                    backgroundColor:
                      itemsPerRow === count ? COLORS.gray300 : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 32,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                    }}
                  >
                    {Array.from({ length: count }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 3,
                          height: 12,
                          backgroundColor:
                            itemsPerRow === count
                              ? COLORS.gray800
                              : COLORS.gray500,
                          borderRadius: 1,
                        }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              color: COLORS.gray600,
            }}
          >
            To create a Collection of products to sell, go to the Ecommerce panel.
          </div>
        )}
        {/* Кнопка "Показать все настройки" рендерится в InlineSettingsModal через onShowAllSettings */}
      </InlineSettingsModal>
    </div>
  )
};

;(CraftContentList as any).craft = {
  displayName: "ContentList",
  props: {
    selectedSource: "",
    itemsPerRow: 1,
  },
  rules: {
    canMoveIn: (nodes: { data: { type: { resolvedName?: string } } }[]) =>
      nodes.every((n) => n.data?.type?.resolvedName === "ContentListCell"),
  },
  isCanvas: true,
}
