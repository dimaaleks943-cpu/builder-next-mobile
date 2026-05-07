import { useEditor, useNode } from "@craftjs/core"
import { useCallback, useEffect, useRef, useState, startTransition } from "react"
import { useLazyGetContentCategoriesQuery } from "../store/extranetApi"
import type { ContentCategory } from "../api/extranet"
import { COLORS } from "../theme/colors"
import { useCollectionFilterScope } from "../pages/builder/context/CollectionFilterScopeContext.tsx"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import { InlineSettingsModal } from "../components/InlineSettingsModal.tsx"
import { useRightPanelContext } from "../pages/builder/context/RightPanelContext.tsx"
import {
  useReactToInlineSettingsOpenRequest,
  type InlineSettingsViewportAnchor,
} from "../pages/builder/context/CraftInlineSettingsBridgeContext.tsx"
import { usePreviewViewport } from "../pages/builder/context/PreviewViewportContext.tsx"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"
import { resolveResponsiveStyle, type ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"

/**
 * Пропсы блока «Фильтр категорий». Выбор пользователя хранится в {@link useCollectionFilterScope}
 * по строке `filterScope`; у {@link CraftContentList} в том же scope подставляются `categoryIds` в запрос items.
 */
type CategoryFilterProps = {
  /** Идентификатор группы фильтра на странице; должен совпадать с `filterScope` у ContentList. */
  filterScope: string
  /** UUID корня дерева категорий в extranet — по нему грузится список кнопок/радио. */
  contentCategoryRootId?: string
  variant?: "buttons" | "radio" | "list"
  direction?: "row" | "column"
  /** Подпись пункта «все категории» (`categoryId === null` в контексте). */
  showAllLabel?: string
  style?: ResponsiveStyle
}

/**
 * Редакторский блок фильтра: загрузка категорий через RTK Query и запись выбора в `CollectionFilterScope`.
 */
export const CraftCategoryFilter = () => {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
  const rightPanelContext = useRightPanelContext()
  const { actions } = useEditor()

  const {
    connectors: { connect, drag },
    props,
    id: nodeId,
  } = useNode((node) => ({
    props: node.data.props as CategoryFilterProps,
    id: node.id,
  }))

  const { selectedCategoryIdByScope, setCategoryForScope } =
    useCollectionFilterScope()
  const [fetchCategories, { data: categoriesResponse, isFetching }] =
    useLazyGetContentCategoriesQuery()
  const viewport = usePreviewViewport()
  const responsiveStyle = resolveResponsiveStyle(props.style, viewport)

  const filterScope = props.filterScope ?? ""
  const contentCategoryRootId = props.contentCategoryRootId ?? ""
  const variant = props.variant ?? "buttons"
  const direction = props.direction ?? "row"
  const showAllLabel = props.showAllLabel ?? "Все"

  // Нормализованный scope — ключ в `selectedCategoryIdByScope` и в `getCollectionItemsCacheKey`.
  const scope = filterScope.trim()
  // `null` означает «Все категории»; иначе UUID выбранной категории для этого scope.
  const selectedId = scope ? selectedCategoryIdByScope[scope] ?? null : null

  const openInlineSettingsModal = useCallback(
    (viewportAnchor: InlineSettingsViewportAnchor | null) => {
      if (viewportAnchor) {
        setModalPosition({
          top: viewportAnchor.top,
          left: viewportAnchor.left,
        })
      } else if (rootRef.current) {
        const rect = rootRef.current.getBoundingClientRect()
        setModalPosition({ top: rect.bottom + 6, left: rect.left })
      }
      setIsSettingsOpen(true)
    },
    [],
  )

  useReactToInlineSettingsOpenRequest(nodeId, openInlineSettingsModal)

  const handleShowAllSettings = () => {
    rightPanelContext?.setTabIndex(1)
    setIsSettingsOpen(false)
  }

  // Список опций фильтра: дочерние категории от указанного корня (content category id).
  useEffect(() => {
    const id = contentCategoryRootId.trim()
    if (!id) return
    void fetchCategories({ contentCategoryId: id, limit: 500 })
  }, [contentCategoryRootId, fetchCategories])

  const categories: ContentCategory[] = categoriesResponse?.data ?? []

  const flexDirection = direction === "column" ? "column" : "row"
  const isList = variant === "list"
  const isRadio = variant === "radio"

  const baseItemStyle: React.CSSProperties = isList
    ? {
        display: "block",
        width: "100%",
        padding: "8px 12px",
        marginBottom: 4,
        cursor: "pointer",
        border: `1px solid ${COLORS.gray300}`,
        borderRadius: 6,
        background: COLORS.white,
        textAlign: "left",
        fontSize: 14,
      }
    : {
        padding: "8px 14px",
        cursor: "pointer",
        borderRadius: 6,
        border: `1px solid ${COLORS.gray300}`,
        background: COLORS.gray100,
        fontSize: 14,
      }

  const activeStyle: React.CSSProperties =
    selectedId === null
      ? {
          borderColor: COLORS.purple400,
          background: COLORS.lightPurple,
          fontWeight: 600,
        }
      : {}

  /** Одна опция: по клику пишем `setCategoryForScope(scope, cat.id)`. */
  const renderSelectable = (cat: ContentCategory, active: boolean) => {
    const style: React.CSSProperties = {
      ...baseItemStyle,
      ...(active
        ? {
            borderColor: COLORS.purple400,
            background: COLORS.lightPurple,
            fontWeight: 600,
          }
        : {}),
    }

    if (isRadio) {
      return (
        <label
          key={cat.id}
          style={{
            ...style,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <input
            type="radio"
            name={`category-filter-${scope}`}
            checked={active}
            onChange={() => scope && setCategoryForScope(scope, cat.id)}
          />
          <span>{cat.name}</span>
        </label>
      )
    }

    return (
      <button
        key={cat.id}
        type="button"
        style={style}
        onClick={() => scope && setCategoryForScope(scope, cat.id)}
      >
        {cat.name}
      </button>
    )
  }

  const rootMissing = !contentCategoryRootId.trim()

  return (
    <>
    <div
      ref={(ref) => {
        rootRef.current = ref
        if (!ref) return
        connect(drag(ref))
      }}
      style={{
        width: (responsiveStyle.width as string | number | undefined) ?? "100%",
        height: responsiveStyle.height as string | number | undefined,
        minWidth: responsiveStyle.minWidth as number | undefined,
        minHeight: (responsiveStyle.minHeight as number | undefined) ?? 48,
        maxWidth: responsiveStyle.maxWidth as string | number | undefined,
        maxHeight: responsiveStyle.maxHeight as string | number | undefined,
        display: "flex",
        flexDirection: "column",
        backgroundColor: (responsiveStyle.backgroundColor as string | undefined) ?? COLORS.white,
        border: `1px solid ${COLORS.gray300}`,
        borderRadius: 4,
        overflow:
          (responsiveStyle.overflow as "auto" | "hidden" | "visible" | "scroll" | undefined) ??
          "visible",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: 12,
          display: "flex",
          flexDirection,
          flexWrap: direction === "row" ? "wrap" : "nowrap",
          gap: direction === "row" ? 8 : 6,
          alignItems: flexDirection === "column" ? "stretch" : "center",
        }}
      >
        {!scope ? (
          <span style={{ color: COLORS.gray600, fontSize: 13 }}>
            Задайте scope в настройках, чтобы связать с ContentList.
          </span>
        ) : rootMissing ? (
          <span style={{ color: COLORS.gray600, fontSize: 13 }}>
            Укажите ID корня категорий в настройках для загрузки списка.
          </span>
        ) : isFetching ? (
          <span style={{ color: COLORS.gray600, fontSize: 13 }}>Загрузка…</span>
        ) : (
          <>
            {isRadio ? (
              <label
                style={{
                  ...baseItemStyle,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  ...activeStyle,
                }}
              >
                <input
                  type="radio"
                  name={`category-filter-${scope}`}
                  checked={selectedId === null}
                  onChange={() => setCategoryForScope(scope, null)}
                />
                <span>{showAllLabel}</span>
              </label>
            ) : (
              <button
                type="button"
                style={{
                  ...baseItemStyle,
                  ...(selectedId === null
                    ? {
                        borderColor: COLORS.purple400,
                        background: COLORS.lightPurple,
                        fontWeight: 600,
                      }
                    : {}),
                }}
                onClick={() => setCategoryForScope(scope, null)}
              >
                {showAllLabel}
              </button>
            )}
            {categories
              .slice()
              .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
              .map((cat) =>
                renderSelectable(
                  cat,
                  selectedId !== null && selectedId === cat.id,
                ),
              )}
          </>
        )}
      </div>
    </div>
    <InlineSettingsModal
      open={isSettingsOpen}
      title="Настройки фильтра категорий"
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
        Scope (строка, как у ContentList)
      </label>
      <input
        type="text"
        placeholder="например, catalog"
        style={{
          width: "100%",
          padding: "6px 8px",
          fontSize: 13,
          borderRadius: 4,
          border: `1px solid ${COLORS.gray300}`,
          marginBottom: 12,
          boxSizing: "border-box",
        }}
        value={filterScope}
        onChange={(e) => {
          const value = e.target.value
          startTransition(() => {
            actions.setProp(nodeId, (nodeProps: CategoryFilterProps) => {
              nodeProps.filterScope = value
            })
          })
        }}
      />

      <label
        style={{
          display: "block",
          marginBottom: 4,
          fontSize: 12,
          color: COLORS.gray700,
        }}
      >
        ID корня категорий (content category)
      </label>
      <input
        type="text"
        placeholder="UUID"
        style={{
          width: "100%",
          padding: "6px 8px",
          fontSize: 13,
          borderRadius: 4,
          border: `1px solid ${COLORS.gray300}`,
          marginBottom: 12,
          boxSizing: "border-box",
        }}
        value={contentCategoryRootId}
        onChange={(e) => {
          const value = e.target.value
          startTransition(() => {
            actions.setProp(nodeId, (nodeProps: CategoryFilterProps) => {
              nodeProps.contentCategoryRootId = value
            })
          })
        }}
      />

      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: COLORS.gray800,
          marginBottom: 8,
        }}
      >
        Вид
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        {(
          [
            ["buttons", "Кнопки"],
            ["radio", "Радио"],
            ["list", "Список"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              actions.setProp(nodeId, (nodeProps: CategoryFilterProps) => {
                nodeProps.variant = v
              })
            }}
            style={{
              padding: "6px 10px",
              borderRadius: 4,
              border: `1px solid ${COLORS.gray300}`,
              background: variant === v ? COLORS.lightPurple : COLORS.white,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: COLORS.gray800,
          marginBottom: 8,
        }}
      >
        Направление
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {(
          [
            ["row", "Строка"],
            ["column", "Колонка"],
          ] as const
        ).map(([d, label]) => (
          <button
            key={d}
            type="button"
            onClick={() => {
              actions.setProp(nodeId, (nodeProps: CategoryFilterProps) => {
                nodeProps.direction = d
              })
            }}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: `1px solid ${COLORS.gray300}`,
              background: direction === d ? COLORS.lightPurple : COLORS.white,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <label
        style={{
          display: "block",
          marginBottom: 4,
          fontSize: 12,
          color: COLORS.gray700,
        }}
      >
        Подпись «Все»
      </label>
      <input
        type="text"
        style={{
          width: "100%",
          padding: "6px 8px",
          fontSize: 13,
          borderRadius: 4,
          border: `1px solid ${COLORS.gray300}`,
          boxSizing: "border-box",
        }}
        value={showAllLabel}
        onChange={(e) => {
          const value = e.target.value
          startTransition(() => {
            actions.setProp(nodeId, (nodeProps: CategoryFilterProps) => {
              nodeProps.showAllLabel = value
            })
          })
        }}
      />
    </InlineSettingsModal>
    </>
  )
};

(CraftCategoryFilter as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.CategoryFilter,
  props: {
    filterScope: "",
    contentCategoryRootId: "",
    variant: "buttons" as const,
    direction: "row" as const,
    showAllLabel: "Все",
    style: {
      [PreviewViewport.DESKTOP]: {
        width: "100%",
        minHeight: 48,
      },
    },
  },
}
