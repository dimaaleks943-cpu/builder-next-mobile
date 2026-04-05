import React, { useCallback, useMemo, useState } from "react";

/**
 * Синхронизация CategoryFilter и ContentList в нативном дереве страницы по строке `filterScope`.
 */
export type CollectionFilterScopeContextValue = {
  /** Выбранная категория по нормализованному scope; `null` — без фильтра по категории. */
  selectedCategoryIdByScope: Record<string, string | null>;
  setCategoryForScope: (scope: string, categoryId: string | null) => void;
};

const defaultValue: CollectionFilterScopeContextValue = {
  selectedCategoryIdByScope: {},
  setCategoryForScope: () => {},
};

const CollectionFilterScopeContext =
  React.createContext<CollectionFilterScopeContextValue>(defaultValue);

/** Оборачивает экран/страницу, где на одном дереве есть и фильтр, и списки с тем же scope. */
export const CollectionFilterScopeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedCategoryIdByScope, setSelectedCategoryIdByScope] = useState<
    Record<string, string | null>
  >({});

  const setCategoryForScope = useCallback(
    (scope: string, categoryId: string | null) => {
      setSelectedCategoryIdByScope((prev) => ({ ...prev, [scope]: categoryId }));
    },
    [],
  );

  const value = useMemo(
    () => ({ selectedCategoryIdByScope, setCategoryForScope }),
    [selectedCategoryIdByScope, setCategoryForScope],
  );

  return (
    <CollectionFilterScopeContext.Provider value={value}>
      {children}
    </CollectionFilterScopeContext.Provider>
  );
};

/** Доступ к выбору категории для блоков фильтра и списков. */
export const useCollectionFilterScope = (): CollectionFilterScopeContextValue =>
  React.useContext(CollectionFilterScopeContext);
