import React from "react"
import { renderComponent } from "@/lib/renderer"
import type { ComponentNode } from "@/lib/interface"
import { getCollectionByKey } from "@/lib/collectionsApi"
import { ContentDataProvider } from "@/components/ContentDataContext"

interface ContentListProps {
  selectedSource?: string
  itemsPerRow?: number
  children?: ComponentNode[]
}

/**
 * Компонент для отображения списка контента (коллекции) на витрине.
 * Это упрощённая версия ContentList из builder - только рендеринг, без редактирования.
 *
 * Логика:
 * 1. Получает коллекцию по selectedSource из API
 * 2. Для каждого элемента коллекции рендерит шаблон из children (первая ячейка)
 * 3. Подставляет данные элемента в шаблон через контекст (если компоненты его используют)
 */
export const ContentList = ({
  selectedSource = "",
  itemsPerRow: itemsPerRowProp,
  children: childrenProp,
}: ContentListProps) => {
  // Нормализуем значения, чтобы дальше работать с строгими типами
  const itemsPerRow: number = itemsPerRowProp ?? 1
  const children: ComponentNode[] = childrenProp ?? []
  const [collectionItems, setCollectionItems] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (!selectedSource) {
      setCollectionItems([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    getCollectionByKey(selectedSource)
      .then((collection) => {
        console.log("Collection loaded:", {
          key: selectedSource,
          itemsCount: collection?.items?.length || 0,
          firstItem: collection?.items?.[0],
        })
        if (collection) {
          setCollectionItems(collection.items || [])
        } else {
          setCollectionItems([])
        }
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Ошибка при загрузке коллекции:", error)
        setCollectionItems([])
        setIsLoading(false)
      })
  }, [selectedSource])

  // Если коллекция не выбрана или загружается, показываем пустой контейнер
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

  // Если коллекция пустая, показываем пустой контейнер
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

  // Разбиваем элементы на строки в зависимости от itemsPerRow
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
            borderBottom:
              rowIndex === rows.length - 1
                ? "none"
                : "1px dashed rgba(108, 93, 211, 0.3)",
          }}
        >
          {row.map((itemData, itemIndex) => {
            const flatIndex = rowIndex * itemsPerRow + itemIndex
            return (
              <ContentListItem
                key={flatIndex}
                itemData={itemData}
                itemsPerRow={itemsPerRow}
                itemIndex={itemIndex}
                rowLength={row.length}
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

/**
 * Одна ячейка списка коллекции
 */
const ContentListItem = ({
  itemData,
  itemsPerRow,
  itemIndex,
  rowLength,
  children,
}: {
  itemData: any
  itemsPerRow: number
  itemIndex: number
  rowLength: number
  children: ComponentNode[]
}) => {
  return (
    <ContentDataProvider collectionKey={null} itemData={itemData}>
      <div
        style={{
          flex: itemsPerRow === 1 ? "none" : 1,
          padding: "16px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          borderRight:
            itemsPerRow > 1 && itemIndex < rowLength - 1
              ? "1px dashed rgba(108, 93, 211, 0.3)"
              : "none",
          boxSizing: "border-box",
        }}
      >
        {/* Рендерим шаблон из children для каждого элемента коллекции */}
        {children && children.length > 0 ? (
          children.map((child, index) => (
            <React.Fragment key={index}>
              {renderComponent(child)}
            </React.Fragment>
          ))
        ) : (
          <div style={{ color: "#999", fontSize: 12 }}>
            No template (children empty)
          </div>
        )}
      </div>
    </ContentDataProvider>
  )
}

// Данные элемента коллекции теперь передаются через общий ContentDataContext,
// чтобы их могли использовать и другие контейнеры (например, таблица).
