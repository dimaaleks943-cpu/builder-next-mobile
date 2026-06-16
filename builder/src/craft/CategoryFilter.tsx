import { useEditor, useNode } from "@craftjs/core"
import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react"
import {
  useGetContentTypesQuery,
  useLazyGetContentCategoriesQuery,
} from "../store/extranetApi"
import { useLazyGetDistributorCategoriesQuery } from "../store/distributorCategoriesApi"
import type { ContentCategory, IDistributorCategory } from "../api/extranet"
import {
  isProductsSelectedSource,
  PRODUCTS_SELECTED_SOURCE,
} from "../constants/contentListSources.ts"
import { COLORS } from "../theme/colors"
import { useCollectionFilterScope } from "../pages/builder/context/CollectionFilterScopeContext.tsx"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import { useRightPanelContext } from "../pages/builder/context/RightPanelContext.tsx"
import {
  useCraftInlineSettingsBridge,
  useReactToInlineSettingsOpenRequest,
  type InlineSettingsViewportAnchor,
} from "../pages/builder/context/CraftInlineSettingsBridgeContext.tsx"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"
import { useCraftNodeStyle } from "../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
import { InlineSettingsModal } from "../components/InlineSettingsModal/InlineSettingsModal.tsx";

/**
 * Пропсы блока «Фильтр категорий». Выбор пользователя хранится в {@link useCollectionFilterScope}
 * по строке `filterScope`; у {@link CraftContentList} в том же scope подставляются `categoryIds` в запрос items.
 */
interface CategoryFilterProps {
  /** Идентификатор группы фильтра на странице; должен совпадать с `filterScope` у ContentList. */
  filterScope: string
  /** Id типа контента extranet или sentinel {@link PRODUCTS_SELECTED_SOURCE} («Товары»). */
  contentCategoryRootId?: string
  variant?: "buttons" | "radio" | "list"
  direction?: "row" | "column"
  /** Подпись пункта «все категории» (`categoryId === null` в контексте). */
  showAllLabel?: string
  styleClassIds?: string[]
  style?: ResponsiveStyle
  htmlId?: string
}

const mapDistributorCategoryToContentCategory = (
  category: IDistributorCategory,
): ContentCategory => ({
  id: String(category.id),
  name: category.name,
  slug: category.slug,
  sort: category.sort,
})

/**
 * Редакторский блок фильтра: категории контента или категории поставщика (для «Товары»);
 * выбор пишется в `CollectionFilterScope`.
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

  const siteId = 1

  const { selectedCategoryIdByScope, setCategoryForScope } =
    useCollectionFilterScope()
  const [fetchCategories, { data: categoriesResponse, isFetching }] =
    useLazyGetContentCategoriesQuery()
  const [
    fetchDistributorCategories,
    { data: distributorCategoriesResponse, isFetching: isDistributorFetching },
  ] = useLazyGetDistributorCategoriesQuery()
  const { data: contentTypesResponse } = useGetContentTypesQuery({ limit: 200 })
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)

  const filterScope = props.filterScope ?? ""
  const contentCategoryRootId = props.contentCategoryRootId ?? ""
  const isProductsRoot = isProductsSelectedSource(contentCategoryRootId)
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

  const { clearInlineSettingsRequest } = useCraftInlineSettingsBridge()

  const closeInlineSettings = useCallback(() => {
    setIsSettingsOpen(false)
    clearInlineSettingsRequest()
  }, [clearInlineSettingsRequest])

  useReactToInlineSettingsOpenRequest(nodeId, openInlineSettingsModal)

  const handleShowAllSettings = () => {
    rightPanelContext?.setTabIndex(1)
    closeInlineSettings()
  }

  const contentTypeOptions = useMemo(() => {
    const productsEntry = { id: PRODUCTS_SELECTED_SOURCE, name: "Товары" }
    const types = (contentTypesResponse?.data ?? [])
      .filter((type) => type.has_categories !== false)
      .filter((type) => type.id !== PRODUCTS_SELECTED_SOURCE)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))

    const currentId = contentCategoryRootId.trim()
    if (
      currentId &&
      currentId !== PRODUCTS_SELECTED_SOURCE &&
      !types.some((type) => type.id === currentId)
    ) {
      return [
        productsEntry,
        { id: currentId, name: `${currentId} (сохранённое значение)` },
        ...types,
      ]
    }

    return [productsEntry, ...types]
  }, [contentTypesResponse?.data, contentCategoryRootId])

  // Категории контента по content_type_id или категории поставщика для «Товары» (distributor_id = site_id).
  useEffect(() => {
    const id = contentCategoryRootId.trim()
    if (!id) return

    if (isProductsSelectedSource(id)) {
      if (typeof siteId !== "number") return
      void fetchDistributorCategories({
        params: { filter: { distributor_id: siteId } },
      })
      return
    }

    void fetchCategories({ contentCategoryId: id, limit: 500 })
  }, [contentCategoryRootId, fetchCategories, fetchDistributorCategories, siteId])

  const categories: ContentCategory[] = useMemo(() => {
    if (isProductsRoot) {
      return (distributorCategoriesResponse ?? []).map(
        mapDistributorCategoryToContentCategory,
      )
    }
    return categoriesResponse?.data ?? []
  }, [isProductsRoot, distributorCategoriesResponse, categoriesResponse?.data])

  const productsSiteMissing = isProductsRoot && typeof siteId !== "number"
  const isCategoriesLoading = isProductsRoot ? isDistributorFetching : isFetching

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
      {...(props.htmlId ? { id: props.htmlId } : {})}
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
            Выберите тип контента в настройках для загрузки списка категорий.
          </span>
        ) : productsSiteMissing ? (
          <span style={{ color: COLORS.gray600, fontSize: 13 }}>
            Не удалось определить site_id страницы для загрузки категорий товаров.
          </span>
        ) : isCategoriesLoading ? (
          <span style={{ color: COLORS.gray600, fontSize: 13 }}>Загрузка…</span>
        ) : categories.length === 0 ? (
          <span style={{ color: COLORS.gray600, fontSize: 13 }}>
            Категории не найдены для выбранного типа.
          </span>
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
      onClose={closeInlineSettings}
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
        Тип контента
      </label>
      <select
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
      >
        <option value="">Не выбран</option>
        {contentTypeOptions.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>

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
