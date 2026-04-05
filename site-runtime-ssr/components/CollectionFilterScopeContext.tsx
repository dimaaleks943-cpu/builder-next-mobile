import React, { useCallback, useMemo, useState } from "react"

/**
 * На витрине связывает блок CategoryFilter с ContentList: общая строка `filterScope` — ключ выбора категории.
 */
export type CollectionFilterScopeContextValue = {
  /** Ключ — нормализованный scope; значение — id категории или `null` (показать все). */
  selectedCategoryIdByScope: Record<string, string | null>
  setCategoryForScope: (scope: string, categoryId: string | null) => void
}

const defaultValue: CollectionFilterScopeContextValue = {
  selectedCategoryIdByScope: {},
  setCategoryForScope: () => {},
}

const CollectionFilterScopeContext =
  React.createContext<CollectionFilterScopeContextValue>(defaultValue)

/** Провайдер страницы: без него фильтр и списки не синхронизируют категорию. */
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

/** Для CategoryFilter и ContentList: текущий выбор и `setCategoryForScope` по строке scope. */
export const useCollectionFilterScope = (): CollectionFilterScopeContextValue =>
  React.useContext(CollectionFilterScopeContext)
