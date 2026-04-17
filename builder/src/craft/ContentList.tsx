import { useNode, useEditor, Element } from "@craftjs/core"
import { useState, useEffect, useRef, startTransition } from "react"
import { useLazyGetContentItemsQuery } from "../store/extranetApi"
import { COLORS } from "../theme/colors"
import { useRightPanelContext } from "../pages/builder/context/RightPanelContext.tsx"
import { useCollectionsContext } from "../pages/builder/context/CollectionsContext.tsx"
import { useCollectionFilterScope } from "../pages/builder/context/CollectionFilterScopeContext.tsx"
import { CraftContentListCell } from "./ContentListCell"
import { ContentListDataContext } from "../pages/builder/context/ContentListDataContext.tsx"
import { InlineSettingsModal } from "../components/InlineSettingsModal.tsx"
import { InlineSettingsBadge } from "../components/InlineSettingsBadge.tsx"
import {
  buildAllCellsSignature,
  buildSubtreeTypePropsFingerprint,
  CELL_IDS_PENDING_SIGNATURE,
  cloneNodeTree,
  collectContentListCellIds,
  getDescendantsWithProps,
  typesMatch,
} from "./contentListEditorUtils"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import {
  DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  resolveCraftVisualEffectsStyle,
  type CraftVisualEffectsProps,
} from "./craftVisualEffects.ts"
import { getCollectionItemsCacheKey } from "../utils/collectionItemsCacheKey"

export type ContentListProps = {
  selectedSource?: string
  itemsPerRow?: number
  /**
   * Строка группы с блоком «Фильтр категорий». Задаёт составной ключ кэша `scope::content_type_id`
   * и включает передачу `categoryIds` в запрос элементов при смене категории в контексте.
   */
  filterScope?: string
  backgroundColor?: string
  /** Зарезервировано под будущий UI; в рендере пока не используется */
  backgroundClip?: string
} & CraftVisualEffectsProps

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
  const rootRef = useRef<HTMLDivElement | null>(null)
  const syncInProgressRef = useRef(false)
  const prevSignaturePartsRef = useRef<string[]>([])
  const lastSeedKeyRef = useRef<string>("")
  const seedCounterRef = useRef(0)

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
  const { selectedCategoryIdByScope } = useCollectionFilterScope()
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
  const filterScope = props.filterScope
  const scopeTrimmed = filterScope?.trim() ?? ""
  // Категория для этого списка: берётся из того же scope, что у CategoryFilter на странице.
  const selectedCategoryIdForList = scopeTrimmed
    ? selectedCategoryIdByScope[scopeTrimmed] ?? null
    : null

  const lastItemsFetchSignatureRef = useRef<string>("")

  // Кэш в CollectionsContext: без scope — голый type id; со scope — `scope::typeId` (несколько списков одного типа).
  const cacheKey = getCollectionItemsCacheKey(filterScope, selectedSource)

  const resolvedItems: any[] =
    selectedSource && collectionsContext
      ? collectionsContext.collectionItemsByKey[cacheKey] ?? []
      : []

  // Подгрузка элементов коллекции в превью редактора: с scope — с фильтром по категории из контекста.
  useEffect(() => {
    if (!selectedSource || !collectionsContext?.setCollectionItems) return

    const collection = collectionsContext.collections.find(
      (c) => c.key === selectedSource,
    )
    if (!collection) return

    // Сигнатура запроса: ключ кэша + выбранная категория (или «все»), чтобы не дёргать API повторно без смены условий.
    const categoryPart = scopeTrimmed
      ? (selectedCategoryIdForList ?? "__all__")
      : "__default__"
    const signature = `${cacheKey}|${categoryPart}`
    if (
      lastItemsFetchSignatureRef.current === signature &&
      collectionsContext.collectionItemsByKey[cacheKey] !== undefined
    ) {
      return
    }

    // В API уходит `category_id` только если задан scope и выбрана конкретная категория (не «Все»).
    const categoryIds =
      scopeTrimmed && selectedCategoryIdForList
        ? [selectedCategoryIdForList]
        : undefined

    let cancelled = false
    void (async () => {
      try {
        const res = await fetchContentItems({
          contentTypeId: selectedSource,
          ...(categoryIds?.length ? { categoryIds } : {}),
        }).unwrap()
        if (cancelled) return
        lastItemsFetchSignatureRef.current = signature
        collectionsContext.setCollectionItems(cacheKey, res?.data ?? [])
      } catch {
        if (cancelled) return
        lastItemsFetchSignatureRef.current = signature
        collectionsContext.setCollectionItems(cacheKey, [])
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    selectedSource,
    filterScope,
    cacheKey,
    scopeTrimmed,
    selectedCategoryIdForList,
    collectionsContext,
    fetchContentItems,
  ])

  const hasCollection = resolvedItems.length > 0
  const cellCount = hasCollection ? resolvedItems.length : 0

  // Seed: только при пустых целях и новом seedKey (lastSeedKeyRef), без пересечения с активным sync (syncInProgressRef).
  const seedInfo = useEditor((state, q) => {
    if (!contentListId || !state.nodes[contentListId] || cellCount <= 1) {
      return {
        templateCellId: "",
        templateChildIds: [] as string[],
        emptyTargetCellIds: [] as string[],
        seedKey: "",
      }
    }
    try {
      const contentListNode = state.nodes[contentListId]
      const linkedNodes = (contentListNode?.data?.linkedNodes ?? {}) as Record<string, string>
      const dataNodes = (contentListNode?.data?.nodes ?? []) as string[]

      const expectedTemplateId = `${contentListId}-cell-0`
      const templateCellId =
        linkedNodes[expectedTemplateId] ?? dataNodes[0] ?? expectedTemplateId

      const templateNode = state.nodes[templateCellId]
      const templateChildIds: string[] = ((templateNode?.data?.nodes ?? []) as string[]) ?? []

      // Сидим только те ячейки, которые уже существуют в state (Element их смонтирует),
      // но остаются пустыми из-за того, что в storage хранится только cell-0.
      const emptyTargetCellIds: string[] = []
      for (let i = 1; i < cellCount; i++) {
        const expectedId = `${contentListId}-cell-${i}`
        const actualId = linkedNodes[expectedId] ?? dataNodes[i] ?? expectedId
        const node = state.nodes[actualId]
        if (!node) continue
        const childIds: string[] = ((node.data?.nodes ?? []) as string[]) ?? []
        if (childIds.length === 0) emptyTargetCellIds.push(actualId)
      }

      const templateFingerprint = templateCellId
        ? buildSubtreeTypePropsFingerprint(state, q, templateCellId)
        : ""

      return {
        templateCellId,
        templateChildIds,
        emptyTargetCellIds,
        seedKey: `${contentListId}|${cellCount}|${templateCellId}|${templateFingerprint}`,
      }
    } catch {
      return {
        templateCellId: "",
        templateChildIds: [] as string[],
        emptyTargetCellIds: [] as string[],
        seedKey: "",
      }
    }
  })

  // Ленивая инициализация: если храним только cell-0, то остальные ячейки в редакторе
  // монтируются, но пустые. Клонируем шаблон (детей cell-0) в каждую пустую ячейку.
  // Invariant seed: см. lastSeedKeyRef — один и тот же seedKey не запускает эффект повторно.
  useEffect(() => {
    if (!hasCollection || cellCount <= 1) return
    if (!seedInfo.templateCellId) return
    if (seedInfo.templateChildIds.length === 0) return
    if (seedInfo.emptyTargetCellIds.length === 0) return
    if (syncInProgressRef.current) return
    if (!seedInfo.seedKey) return
    if (lastSeedKeyRef.current === seedInfo.seedKey) return

    lastSeedKeyRef.current = seedInfo.seedKey

    try {
      const trees: any[] = []
      for (const cid of seedInfo.templateChildIds) {
        try {
          trees.push(query.node(cid).toNodeTree("childNodes"))
        } catch {
          // skip invalid node
        }
      }
      if (trees.length === 0) return

      const batched = actions.history.merge()
      for (const targetCellId of seedInfo.emptyTargetCellIds) {
        let targetNode
        try {
          targetNode = query.node(targetCellId).get()
        } catch {
          continue
        }
        const targetChildIds: string[] = (targetNode?.data?.nodes as string[]) ?? []
        for (const childId of targetChildIds) {
          try {
            batched.delete(childId)
          } catch {
            // ignore
          }
        }
        const seedPrefixBase = `${targetCellId}__seed__${seedCounterRef.current++}`
        for (const tree of trees) {
          const cloned = cloneNodeTree(tree, seedPrefixBase)
          batched.addNodeTree(cloned, targetCellId)
        }
      }
    } catch {
      // ignore
    }
  }, [
    hasCollection,
    cellCount,
    seedInfo.templateCellId,
    seedInfo.templateChildIds,
    seedInfo.emptyTargetCellIds,
    seedInfo.seedKey,
    actions,
    query,
  ])

  // Структурные id ячеек + контентная подпись (fingerprint по state.nodes, без getSerializedNodes).
  const cellIdsAndSignature = useEditor((state, q) => {
    if (!contentListId || !state.nodes[contentListId] || cellCount === 0) {
      return { cellIds: [] as string[], signature: "" }
    }
    try {
      const collected = collectContentListCellIds(state, contentListId, cellCount)
      if (collected.status === "pending") {
        return { cellIds: [] as string[], signature: CELL_IDS_PENDING_SIGNATURE }
      }
      if (collected.status === "empty" || collected.cellIds.length === 0) {
        return { cellIds: [] as string[], signature: "" }
      }
      const signature = buildAllCellsSignature(state, q, collected.cellIds)
      return { cellIds: collected.cellIds, signature }
    } catch {
      return { cellIds: [] as string[], signature: "" }
    }
  })

  // Строка-подпись, описывающая структуру и props всех ячеек (каждой отдельно и всех вместе)
  const anyCellTemplateSignature = cellIdsAndSignature.signature
  // Массив фактических id ячеек ContentList в сторе Craft.js
  const actualCellIds = cellIdsAndSignature.cellIds

  // Sync: при смене подписи ячеек копируем изменения из отличающейся ячейки в остальные.
  // Invariant: не стартуем, пока signature === pending; syncInProgressRef блокирует вложенные батчи.
  useEffect(() => {
    if (!hasCollection || actualCellIds.length <= 1 || syncInProgressRef.current) return
    if (anyCellTemplateSignature === CELL_IDS_PENDING_SIGNATURE || anyCellTemplateSignature === "") return

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
        rootRef.current = ref
        if (!ref) return
        connect(drag(ref))
      }}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: selected
          ? COLORS.lightPurple
          : (props.backgroundColor ?? COLORS.white),
        border: selected
          ? `2px solid ${COLORS.purple400}`
          : `1px solid ${COLORS.gray300}`,
        borderRadius: 4,
        overflow: "visible",
        position: "relative",
        ...resolveCraftVisualEffectsStyle(props),
      }}
    >
      {selected && (
        <InlineSettingsBadge
          ref={badgeRef}
          icon={<span>CL</span>}
          label="Список-контента"
          anchorElement={rootRef.current}
          usePortal
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

        <label
          style={{
            display: "block",
            marginTop: 8,
            marginBottom: 4,
            fontSize: 12,
            color: COLORS.gray700,
          }}
        >
          Filter scope (как у блока «Фильтр категорий»)
        </label>
        <input
          type="text"
          placeholder="например, catalog — оставьте пустым, если фильтр не нужен"
          style={{
            width: "100%",
            padding: "6px 8px",
            fontSize: 13,
            borderRadius: 4,
            border: `1px solid ${COLORS.gray300}`,
            marginBottom: 8,
            boxSizing: "border-box",
          }}
          value={props.filterScope ?? ""}
          onChange={(e) => {
            const value = e.target.value
            startTransition(() => {
              actions.setProp(contentListId, (nodeProps: ContentListProps) => {
                nodeProps.filterScope = value
              })
            })
          }}
        />
        <div
          style={{
            fontSize: 11,
            color: COLORS.gray600,
            marginBottom: selectedSource ? 0 : 8,
            lineHeight: 1.35,
          }}
        >
          Должен совпадать со строкой scope у фильтра категорий на странице.
        </div>

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
  displayName: CRAFT_DISPLAY_NAME.ContentList,
  props: {
    selectedSource: "",
    itemsPerRow: 1,
    filterScope: "",
    backgroundColor: undefined,
    backgroundClip: undefined,
    ...DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  },
  rules: {
    canMoveIn: (nodes: { data: { type: { resolvedName?: string } } }[]) =>
      nodes.every((n) => n.data?.type?.resolvedName === "ContentListCell"),
  },
  isCanvas: true,
}
