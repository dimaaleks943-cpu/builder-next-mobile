import React, { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Синхронизация CategoryFilter и ContentList по `filterScope` (паритет с site-runtime-ssr).
 */
export type CollectionFilterScopeContextValue = {
  selectedCategoryIdByScope: Record<string, string | null>;
  selectedCategorySlugByScope: Record<string, string | null>;
  setCategoryForScope: (
    scope: string,
    categoryId: string | null,
    categorySlug?: string | null,
  ) => void;
};

const defaultValue: CollectionFilterScopeContextValue = {
  selectedCategoryIdByScope: {},
  selectedCategorySlugByScope: {},
  setCategoryForScope: () => {},
};

const CollectionFilterScopeContext =
  React.createContext<CollectionFilterScopeContextValue>(defaultValue);

export const CollectionFilterScopeProvider = ({
  children,
  initialSelectedCategoryIdByScope = {},
  initialSelectedCategorySlugByScope = {},
}: {
  children: React.ReactNode;
  initialSelectedCategoryIdByScope?: Record<string, string | null>;
  initialSelectedCategorySlugByScope?: Record<string, string | null>;
}) => {
  const [selectedCategoryIdByScope, setSelectedCategoryIdByScope] = useState<
    Record<string, string | null>
  >(() => ({ ...initialSelectedCategoryIdByScope }));

  const [selectedCategorySlugByScope, setSelectedCategorySlugByScope] =
    useState<Record<string, string | null>>(() => ({
      ...initialSelectedCategorySlugByScope,
    }));

  useEffect(() => {
    setSelectedCategoryIdByScope({ ...initialSelectedCategoryIdByScope });
  }, [initialSelectedCategoryIdByScope]);

  useEffect(() => {
    setSelectedCategorySlugByScope({ ...initialSelectedCategorySlugByScope });
  }, [initialSelectedCategorySlugByScope]);

  const setCategoryForScope = useCallback(
    (
      scope: string,
      categoryId: string | null,
      categorySlug?: string | null,
    ) => {
      setSelectedCategoryIdByScope((prev) => ({ ...prev, [scope]: categoryId }));
      setSelectedCategorySlugByScope(
        (prev): Record<string, string | null> => {
          if (categoryId === null) {
            return { ...prev, [scope]: null };
          }
          if (categorySlug !== undefined) {
            return {
              ...prev,
              [scope]:
                categorySlug != null && String(categorySlug).trim()
                  ? String(categorySlug).trim()
                  : null,
            };
          }
          return prev;
        },
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      selectedCategoryIdByScope,
      selectedCategorySlugByScope,
      setCategoryForScope,
    }),
    [selectedCategoryIdByScope, selectedCategorySlugByScope, setCategoryForScope],
  );

  return (
    <CollectionFilterScopeContext.Provider value={value}>
      {children}
    </CollectionFilterScopeContext.Provider>
  );
};

export const useCollectionFilterScope = (): CollectionFilterScopeContextValue =>
  React.useContext(CollectionFilterScopeContext);
