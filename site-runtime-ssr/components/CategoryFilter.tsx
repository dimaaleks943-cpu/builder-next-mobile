import React from "react"
import { fetchContentCategories } from "@/lib/categoriesApi"
import type { ContentCategory } from "@/lib/contentTypes"
import { useSiteCollections } from "@/components/SiteCollectionsContext"
import { useCollectionFilterScope } from "@/components/CollectionFilterScopeContext"

/** Пропсы сериализованного блока; `filterScope` должен совпадать с ContentList на той же странице. */
export type CategoryFilterProps = {
  filterScope: string
  /** UUID корня дерева категорий — в API уходит `filter` с `category_id`. */
  contentCategoryRootId?: string
  variant?: "buttons" | "radio" | "list"
  direction?: "row" | "column"
  showAllLabel?: string
}

/** Навигация по категориям: пишет выбор в контекст: ContentList с тем же `filterScope` перезапрашивает items. */
const CategoryFilterComponent = ({
  filterScope,
  contentCategoryRootId = "",
  variant = "buttons",
  direction = "row",
  showAllLabel = "Все",
}: CategoryFilterProps) => {
  const { domain } = useSiteCollections()
  const { selectedCategoryIdByScope, setCategoryForScope } =
    useCollectionFilterScope()
  const scope = filterScope.trim()
  const selectedId = scope ? selectedCategoryIdByScope[scope] ?? null : null
  const rootId = contentCategoryRootId.trim()
  const rootMissing = !rootId

  const [categories, setCategories] = React.useState<ContentCategory[]>([])
  const [loading, setLoading] = React.useState(() => Boolean(rootId))

  // Загрузка плоского списка категорий под фильтр (от корня дерева в настройках блока).
  React.useEffect(() => {
    if (!domain || !rootId) {
      setCategories([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)

    fetchContentCategories(domain, {
      categoryRootId: rootId,
      limit: 500,
    })
      .then((data) => {
        console.log("fetchContentCategories1231", data)

        if (!cancelled) setCategories(data ?? [])
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [domain, rootId])

  if (!scope) {
    return null
  }

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
        border: "1px solid #ddd",
        borderRadius: 6,
        background: "#fff",
        textAlign: "left",
        fontSize: 14,
      }
    : {
        padding: "8px 14px",
        cursor: "pointer",
        borderRadius: 6,
        border: "1px solid #ccc",
        background: "#f5f5f5",
        fontSize: 14,
      }

  const activeStyle: React.CSSProperties =
    selectedId === null
      ? { borderColor: "#333", background: "#e8e8e8", fontWeight: 600 }
      : {}

  const renderSelectable = (cat: ContentCategory, active: boolean) => {
    const style: React.CSSProperties = {
      ...baseItemStyle,
      ...(active
        ? { borderColor: "#333", background: "#e8e8e8", fontWeight: 600 }
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
            onChange={() => setCategoryForScope(scope, cat.id)}
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
        onClick={() => setCategoryForScope(scope, cat.id)}
      >
        {cat.name}
      </button>
    )
  }

  return (
    <nav
      aria-label="Фильтр категорий"
      style={{
        display: "flex",
        flexDirection,
        flexWrap: direction === "row" ? "wrap" : "nowrap",
        gap: direction === "row" ? 8 : 6,
        alignItems: flexDirection === "column" ? "stretch" : "center",
        marginBottom: 16,
      }}
    >
      {loading ? (
        <span style={{ color: "#888", fontSize: 14 }}>Загрузка…</span>
      ) : rootMissing ? (
        <span style={{ color: "#888", fontSize: 13 }}>
          Укажите ID корня категорий в настройках блока для загрузки списка.
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
                      borderColor: "#333",
                      background: "#e8e8e8",
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
            .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)) /* порядок из CMS */
            .map((cat) =>
              renderSelectable(cat, selectedId !== null && selectedId === cat.id),
            )}
        </>
      )}
    </nav>
  )
}

CategoryFilterComponent.displayName = "CategoryFilter"

export const CategoryFilter = CategoryFilterComponent
