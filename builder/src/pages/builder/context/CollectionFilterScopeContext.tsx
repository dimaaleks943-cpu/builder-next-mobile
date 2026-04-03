import { createContext, useCallback, useContext, useMemo, useState } from "react"

/**
 * Связка «Фильтр категорий» ↔ ContentList на одной странице/в одном дереве:
 * общая строка `filterScope` используется как ключ, здесь хранится выбранная категория (или «все»).
 */
export type CollectionFilterScopeContextValue = {
  /** Ключ — trim(scope); значение — UUID категории или `null` («Все категории»). */
  selectedCategoryIdByScope: Record<string, string | null>
  /** Обновить выбор для группы фильтра; ContentList с тем же scope подхватит через подписку на контекст. */
  setCategoryForScope: (scope: string, categoryId: string | null) => void
}

const defaultValue: CollectionFilterScopeContextValue = {
  selectedCategoryIdByScope: {},
  setCategoryForScope: () => {},
}

export const CollectionFilterScopeContext =
  createContext<CollectionFilterScopeContextValue>(defaultValue)

/** Оборачивает canvas билдера, чтобы фильтр и списки делили состояние выбора категории. */
export const CollectionFilterScopeProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [selectedCategoryIdByScope, setSelectedCategoryIdByScope] = useState<
    Record<string, string | null>
  >({})

  const setCategoryForScope = useCallback(
    (scope: string, categoryId: string | null) => {
      setSelectedCategoryIdByScope((prev) => ({ ...prev, [scope]: categoryId }))
    },
    [],
  )

  const value = useMemo(
    () => ({ selectedCategoryIdByScope, setCategoryForScope }),
    [selectedCategoryIdByScope, setCategoryForScope],
  )

  return (
    <CollectionFilterScopeContext.Provider value={value}>
      {children}
    </CollectionFilterScopeContext.Provider>
  )
}

/** Хук для CategoryFilter / CraftContentList: чтение и смена категории по `filterScope`. */
export const useCollectionFilterScope = (): CollectionFilterScopeContextValue =>
  useContext(CollectionFilterScopeContext)
