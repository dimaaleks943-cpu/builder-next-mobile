import React from "react"
import { useRouter } from "next/router"
import { fetchContentCategories } from "@/lib/categoriesApi"
import type { ContentCategory } from "@/lib/contentTypes"
import { buildStorefrontCategoryUrl } from "@/lib/catalogPathResolve"
import { prefixPublicPath } from "@/lib/localeFromPath"
import { useSiteCollections } from "@/components/SiteCollectionsContext"
import { useCollectionFilterScope } from "@/components/CollectionFilterScopeContext"
import { useStorefrontPage } from "@/components/StorefrontPageContext"
import {
  DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  resolveCraftVisualEffectsStyle,
  type CraftVisualEffectsProps,
} from "@/lib/craftVisualEffects"

/** Пропсы сериализованного блока; `filterScope` должен совпадать с ContentList на той же странице. */
export type CategoryFilterProps = {
  filterScope: string
  /** UUID корня дерева категорий — в API уходит `filter` с `category_id`. */
  contentCategoryRootId?: string
  variant?: "buttons" | "radio" | "list"
  direction?: "row" | "column"
  showAllLabel?: string
  backgroundColor?: string
  /** Зарезервировано под будущий UI; в рендере пока не используется */
  backgroundClip?: string
} & CraftVisualEffectsProps

/** Навигация по категориям: пишет выбор в контекст: ContentList с тем же `filterScope` перезапрашивает items. */
const CategoryFilterComponent = ({
  filterScope,
  contentCategoryRootId = "",
  variant = "buttons",
  direction = "row",
  showAllLabel = "Все",
  backgroundColor = "#FFFFFF",
  backgroundClip: _backgroundClip,
  mixBlendMode = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.mixBlendMode,
  opacityPercent = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.opacityPercent,
  outlineStyleMode = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineStyleMode,
  outlineWidth = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineWidth,
  outlineOffset = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineOffset,
  outlineColor = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineColor,
}: CategoryFilterProps) => {
  const { domain } = useSiteCollections()
  const router = useRouter()
  const { locale, pageBaseSlug } = useStorefrontPage()
  const { selectedCategoryIdByScope, setCategoryForScope } =
    useCollectionFilterScope()
  const scope = filterScope.trim()

  const applyCategory = React.useCallback(
    (categoryId: string | null, categorySlug: string | null) => {
      setCategoryForScope(scope, categoryId, categorySlug)
      if (categoryId !== null && !categorySlug?.trim()) {
        return
      }
      const url = prefixPublicPath(
        buildStorefrontCategoryUrl(pageBaseSlug, categorySlug),
        locale,
      )
      void router.push(url, undefined, { scroll: false })
    },
    [locale, pageBaseSlug, router, scope, setCategoryForScope],
  )
  const selectedId = scope ? selectedCategoryIdByScope[scope] ?? null : null
  const rootId = (contentCategoryRootId as string).trim()
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
            onChange={() =>
              applyCategory(
                cat.id,
                typeof cat.slug === "string" && cat.slug.trim()
                  ? cat.slug.trim()
                  : null,
              )
            }
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
        onClick={() =>
          applyCategory(
            cat.id,
            typeof cat.slug === "string" && cat.slug.trim()
              ? cat.slug.trim()
              : null,
          )
        }
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
        backgroundColor,
        padding: 12,
        borderRadius: 4,
        boxSizing: "border-box",
        ...resolveCraftVisualEffectsStyle({
          mixBlendMode,
          opacityPercent,
          outlineStyleMode,
          outlineWidth,
          outlineOffset,
          outlineColor,
        }),
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
                onChange={() => applyCategory(null, null)}
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
              onClick={() => applyCategory(null, null)}
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
