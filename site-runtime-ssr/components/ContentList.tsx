import React from "react"
import { renderComponent } from "@/lib/renderer"
import type { ComponentNode } from "@/lib/interface"
import { getCollectionByKey } from "@/lib/collectionsApi"
import { ContentDataProvider } from "@/components/ContentDataContext"
import { useSiteCollections } from "@/components/SiteCollectionsContext"
import type { IContentItem } from "@/lib/contentTypes"

type CellLayoutMode = "block" | "flex" | "grid" | "absolute"

interface ContentListProps {
  selectedSource?: string
  itemsPerRow?: number
  cellLayout?: CellLayoutMode
  cellGridColumns?: number
  cellGridRows?: number
  cellGridAutoFlow?: "row" | "column" | null
  cellGap?: number | null
  cellFlexFlow?: "row" | "column" | "wrap" | null
  cellFlexJustifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | null
  cellFlexAlignItems?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "stretch"
    | "baseline"
    | null
  cellPlaceItemsY?: "start" | "center" | "end" | "stretch" | "baseline" | null
  cellPlaceItemsX?: "start" | "center" | "end" | "stretch" | "baseline" | null
  children?: ComponentNode[]
}

/**
 * Компонент для отображения списка контента (коллекции) на витрине.
 * Упрощённая версия ContentList из builder — только рендеринг, без редактирования.
 *
 * Логика:
 * 1. Получает коллекцию по selectedSource из API
 * 2. Для каждого элемента коллекции рендерит шаблон из children (первая ячейка)
 * 3. Подставляет данные элемента в шаблон через ContentDataProvider
 */
export const ContentList = ({
  selectedSource = "",
  itemsPerRow: itemsPerRowProp,
  cellLayout = "block",
  cellGridColumns,
  cellGridRows,
  cellGridAutoFlow,
  cellGap,
  cellFlexFlow,
  cellFlexJustifyContent,
  cellFlexAlignItems,
  cellPlaceItemsY,
  cellPlaceItemsX,
  children: childrenProp,
}: ContentListProps) => {
  const itemsPerRow: number = itemsPerRowProp ?? 1
  const children: ComponentNode[] = childrenProp ?? []
  const { domain, collectionItemsByTypeId } = useSiteCollections()
  const fromSsr = collectionItemsByTypeId[selectedSource]
  const [fallbackItems, setFallbackItems] = React.useState<IContentItem[] | null>(
    null,
  )
  const [fetchLoading, setFetchLoading] = React.useState(
    () =>
      !!selectedSource &&
      fromSsr === undefined &&
      !!domain,
  )

  React.useEffect(() => {
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
  }, [selectedSource, domain, fromSsr])

  const collectionItems: IContentItem[] =
    fromSsr !== undefined ? fromSsr : (fallbackItems ?? [])

  const isLoading =
    !!selectedSource && fromSsr === undefined && fetchLoading

  if (!selectedSource || isLoading) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 300,
        }}
      />
    )
  }

  if (collectionItems.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 300,
        }}
      />
    )
  }

  const rows: any[][] = []
  for (let i = 0; i < collectionItems.length; i += itemsPerRow) {
    rows.push(collectionItems.slice(i, i + itemsPerRow))
  }

  return (
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
                layout={cellLayout}
                gridColumns={cellGridColumns}
                gridRows={cellGridRows}
                gridAutoFlow={cellGridAutoFlow ?? undefined}
                gap={cellGap ?? undefined}
                flexFlow={cellFlexFlow ?? undefined}
                flexJustifyContent={cellFlexJustifyContent ?? undefined}
                flexAlignItems={cellFlexAlignItems ?? undefined}
                placeItemsY={cellPlaceItemsY ?? undefined}
                placeItemsX={cellPlaceItemsX ?? undefined}
              >
                {children}
              </ContentListItem>
            )
          })}
        </div>
      ))}
    </div>
  )
}

interface ContentListItemProps {
  itemData: IContentItem
  collectionKey: string | null
  itemsPerRow: number
  layout?: "block" | "flex" | "grid" | "absolute"
  gridColumns?: number
  gridRows?: number
  gridAutoFlow?: "row" | "column"
  gap?: number
  flexFlow?: "row" | "column" | "wrap"
  flexJustifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
  flexAlignItems?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "stretch"
    | "baseline"
  placeItemsY?: "start" | "center" | "end" | "stretch" | "baseline"
  placeItemsX?: "start" | "center" | "end" | "stretch" | "baseline"
  children: ComponentNode[]
}

/**
 * Одна ячейка списка коллекции.
 * Применяет layout/gridColumns/gridRows из первой ячейки (ContentListCell) билдера.
 */
const ContentListItem = ({
  itemData,
  collectionKey,
  itemsPerRow,
  layout = "block",
  gridColumns,
  gridRows,
  gridAutoFlow = "row",
  gap,
  flexFlow = "row",
  flexJustifyContent,
  flexAlignItems,
  placeItemsY,
  placeItemsX,
  children,
}: ContentListItemProps) => {
  const displayStyle =
    layout === "flex" ? "flex" : layout === "grid" ? "grid" : "block"

  return (
    <ContentDataProvider collectionKey={collectionKey} itemData={itemData}>
      <div
        style={{
          flex: itemsPerRow === 1 ? "none" : 1,
          minHeight: 48,
          padding: "16px",
          position: "relative",
          display: displayStyle,
          flexDirection:
            layout === "flex"
              ? flexFlow === "column"
                ? "column"
                : "row"
              : undefined,
          flexWrap:
            layout === "flex" ? (flexFlow === "wrap" ? "wrap" : "nowrap") : undefined,
          justifyContent: layout === "flex" ? flexJustifyContent : undefined,
          alignItems:
            layout === "flex" ? (flexAlignItems ?? "flex-start") : "flex-start",
          gap:
            (layout === "grid" || layout === "flex") &&
            gap != null &&
            gap >= 0
              ? gap
              : undefined,
          gridTemplateColumns:
            layout === "grid" && gridColumns && gridColumns > 0
              ? `repeat(${gridColumns}, minmax(0, 1fr))`
              : undefined,
          gridTemplateRows:
            layout === "grid" && gridRows && gridRows > 0
              ? `repeat(${gridRows}, auto)`
              : undefined,
          gridAutoFlow: layout === "grid" ? gridAutoFlow : undefined,
          placeItems:
            layout === "grid" && placeItemsY && placeItemsX
              ? `${placeItemsY} ${placeItemsX}`
              : undefined,
          boxSizing: "border-box",
        }}
      >
        {children && children.length > 0 ? (
          children.map((child, index) => (
            <React.Fragment key={index}>
              {renderComponent(child)}
            </React.Fragment>
          ))
        ) : (
          <div style={{ color: "#999", fontSize: 12 }}>No template</div>
        )}
      </div>
    </ContentDataProvider>
  )
}
