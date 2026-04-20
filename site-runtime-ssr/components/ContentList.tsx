import React from "react"
import { fetchContentItems, getCollectionByKey } from "@/lib/collectionsApi"
import { ContentDataProvider } from "@/components/ContentDataContext"
import { ContentListProvider } from "@/components/ContentListContext"
import { useSiteCollections } from "@/components/SiteCollectionsContext"
import { useCollectionFilterScope } from "@/components/CollectionFilterScopeContext"
import { getCollectionItemsCacheKey } from "@/lib/collectionItemsCacheKey"
import type { IContentItem } from "@/lib/contentTypes"
import type { CraftVisualEffectsProps } from "@/lib/craftVisualEffects"

/**
 * Маркер «эффект ещё не сопоставлял категорию с предыдущим запуском».
 * Нужен, чтобы при первом монтировании со scope не устроить лишний fetch, если SSR уже положил items в кэш под «Все».
 */
const CATEGORY_FETCH_INIT = Symbol("categoryFetchInit")

interface ContentListProps extends CraftVisualEffectsProps {
  className?: string
  "data-craft-node-id"?: string
  /** Должен совпадать с `filterScope` на блоке фильтра категорий, если используется. */
  filterScope?: string
  selectedSource?: string
  itemsPerRow?: number
  /**
   * Класс обёртки ячейки (первая ContentListCell в Craft).
   * Визуальные стили ячейки — в `#craft-responsive-css` из `cellStyle` на узле ContentList.
   */
  cellClassName?: string
  /** Зарезервировано под будущий UI; в рендере пока не используется */
 children?: React.ReactNode
}

/**
 * Компонент для отображения списка контента (коллекции) на витрине.
 * Упрощённая версия ContentList из builder — только рендеринг, без редактирования.
 *
 * Логика:
 * 1. Получает коллекцию по selectedSource из API
 * 2. Для каждого элемента коллекции рендерит шаблон из children (первая ячейка)
 * 3. Подставляет данные элемента в шаблон через ContentDataProvider
 *
 * Фильтр категорий: при непустом `filterScope` слушаем `useCollectionFilterScope`, перезапрашиваем items с `categoryIds`.
 * Пока идёт запрос при уже показанном списке — stale-while-revalidate: список не скрываем, показываем оверлей.
 */
export const ContentList = ({
  className,
  "data-craft-node-id": dataCraftNodeId,
  filterScope,
  selectedSource = "",
  itemsPerRow: itemsPerRowProp,
  cellClassName,
  children: childrenProp,
}: ContentListProps) => {
  const itemsPerRow: number = itemsPerRowProp ?? 1
  const templateChildren = childrenProp
  const { domain, collectionItemsByKey, setItemsForKey } = useSiteCollections()
  const { selectedCategoryIdByScope } = useCollectionFilterScope()
  const scopeTrimmed = filterScope?.trim() ?? ""
  const selectedCategoryId = scopeTrimmed
    ? selectedCategoryIdByScope[scopeTrimmed] ?? null
    : null

  const cacheKey = getCollectionItemsCacheKey(filterScope, selectedSource)
  const fromSsr = collectionItemsByKey[cacheKey]
  const [fallbackItems, setFallbackItems] = React.useState<IContentItem[] | null>(
    null,
  )
  // Загрузка коллекции без scope (клиентский fallback, если слот в провайдере пуст).
  const [fetchLoading, setFetchLoading] = React.useState(
    () =>
      !!selectedSource &&
      fromSsr === undefined &&
      !!domain,
  )
  // Загрузка после смены категории при включённом filterScope (оверлей или блокирующий плейсхолдер).
  const [filterLoading, setFilterLoading] = React.useState(
    () =>
      !!scopeTrimmed &&
      !!selectedSource &&
      collectionItemsByKey[cacheKey] === undefined,
  )

  const prevCategoryRef = React.useRef<string | null | typeof CATEGORY_FETCH_INIT>(
    CATEGORY_FETCH_INIT,
  )

  // Смена scope/source — снова считаем первый проход эффекта «инициализацией».
  React.useEffect(() => {
    prevCategoryRef.current = CATEGORY_FETCH_INIT
  }, [filterScope, selectedSource])

  // Клиентский fetch при смене категории (или при первом появлении данных для scope-списка).
  React.useEffect(() => {
    if (!scopeTrimmed || !selectedSource || !domain) {
      return
    }

    const cat = selectedCategoryId

    if (prevCategoryRef.current === CATEGORY_FETCH_INIT) {
      prevCategoryRef.current = cat
      // Уже есть префетч SSR — не дублируем запрос при гидрации (все или с category_id).
      if (collectionItemsByKey[cacheKey] !== undefined) {
        return
      }
    } else if (prevCategoryRef.current === cat) {
      return
    } else {
      prevCategoryRef.current = cat
    }

    let cancelled = false
    setFilterLoading(true)
    fetchContentItems(domain, selectedSource, {
      categoryIds: cat ? [cat] : undefined,
    })
      .then((items) => {
        if (!cancelled && items != null) {
          setItemsForKey(cacheKey, items)
        }
      })
      .catch((error) => {
        console.error("Ошибка при загрузке коллекции с фильтром:", error)
      })
      .finally(() => {
        if (!cancelled) setFilterLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    scopeTrimmed,
    selectedSource,
    domain,
    selectedCategoryId,
    setItemsForKey,
    cacheKey,
    collectionItemsByKey[cacheKey],
  ])

  // Без filterScope — данные из SSR или единичный getCollectionByKey на клиенте (старый путь без категорий).
  React.useEffect(() => {
    if (scopeTrimmed) {
      return
    }
    if (fromSsr !== undefined) {
      setFallbackItems(null)
      setFetchLoading(false)
      return
    }
    if (!selectedSource || !domain) {
      setFallbackItems([])
      setFetchLoading(false)
      return
    }

    let cancelled = false
    setFetchLoading(true)
    getCollectionByKey(domain, selectedSource)
      .then((collection) => {
        if (!cancelled) {
          setFallbackItems(collection?.items ?? [])
        }
      })
      .catch((error) => {
        console.error("Ошибка при загрузке коллекции:", error)
        if (!cancelled) setFallbackItems([])
      })
      .finally(() => {
        if (!cancelled) setFetchLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedSource, domain, fromSsr, cacheKey, scopeTrimmed])

  const collectionItems: IContentItem[] =
    fromSsr !== undefined ? fromSsr : (fallbackItems ?? [])

  // Плейсхолдер без списка: только когда показывать нечего и идёт первичная загрузка (фильтр или без SSR).
  const blockingLoading =
    !!selectedSource &&
    collectionItems.length === 0 &&
    (filterLoading ||
      (!scopeTrimmed && fromSsr === undefined && fetchLoading))

  // Список уже на экране — не схлопываем высоту; затемняем и блокируем клики до прихода новых items.
  const showFilterOverlay =
    filterLoading && collectionItems.length > 0

  if (!selectedSource || blockingLoading) {
    return (
      <div
        className={className}
        data-craft-node-id={dataCraftNodeId}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 300,
        }}
        aria-busy={blockingLoading ? true : undefined}
      />
    )
  }

  if (collectionItems.length === 0) {
    return (
      <div
        className={className}
        data-craft-node-id={dataCraftNodeId}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 300,
        }}
      />
    )
  }

  const rows: IContentItem[][] = []
  for (let i = 0; i < collectionItems.length; i += itemsPerRow) {
    rows.push(collectionItems.slice(i, i + itemsPerRow))
  }

  return (
    <ContentListProvider filterScope={scopeTrimmed || undefined}>
    <div
      className={className}
      data-craft-node-id={dataCraftNodeId}
      style={{
        position: "relative",
        width: "100%",
      }}
      aria-busy={filterLoading ? true : undefined}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: "flex",
              flexDirection: itemsPerRow === 1 ? "column" : "row",
            }}
          >
            {row.map((itemData, itemIndex) => {
              const flatIndex = rowIndex * itemsPerRow + itemIndex
              return (
                <ContentListItem
                  key={flatIndex}
                  itemData={itemData}
                  collectionKey={selectedSource}
                  itemsPerRow={itemsPerRow}
                  cellClassName={cellClassName}
                >
                  {templateChildren}
                </ContentListItem>
              )
            })}
          </div>
        ))}
      </div>
      {showFilterOverlay ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-hidden
        >
          <span style={{ fontSize: 14, color: "#666" }}>Обновление…</span>
        </div>
      ) : null}
    </div>
    </ContentListProvider>
  )
}

interface ContentListItemProps {
  itemData: IContentItem
  collectionKey: string | null
  itemsPerRow: number
  cellClassName?: string
  children?: React.ReactNode
}

/**
 * Одна ячейка списка коллекции.
 * Визуал ячейки — из `cellClassName` + CSS из `cellStyle` (см. buildResponsiveCss).
 */
const ContentListItem = ({
  itemData,
  collectionKey,
  itemsPerRow,
  cellClassName,
  children,
}: ContentListItemProps) => {
  return (
    <ContentDataProvider collectionKey={collectionKey} itemData={itemData}>
      <div
        className={cellClassName}
        style={{
          flex: itemsPerRow === 1 ? "none" : 1,
          minWidth: 0,
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {React.Children.count(children) > 0 ? (
          children
        ) : (
          <div style={{ color: "#999", fontSize: 12 }}>No template</div>
        )}
      </div>
    </ContentDataProvider>
  )
}
