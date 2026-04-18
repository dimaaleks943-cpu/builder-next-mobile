import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text as RNText,
  ActivityIndicator,
} from "react-native";
import type { ComponentNode } from "../content/interface";
import {
  fetchContentItems,
  getCollectionByKey,
} from "../api/collectionsApi";
import type { IContentItem } from "../api/contentTypes";
import { ContentDataProvider } from "../contexts/ContentDataContext";
import { ContentListProvider } from "../contexts/ContentListContext";
import { useCollectionFilterScope } from "../contexts/CollectionFilterScopeContext";
import { useSiteCollections } from "../contexts/SiteCollectionsContext";
import { getCollectionItemsCacheKey } from "../lib/collectionItemsCacheKey";
import { renderComponent } from "../content/renderer";
import { resolveCraftVisualEffectsRnStyle } from "../lib/craftVisualEffectsRn";
import { withOpacityHex } from "../lib/withOpacityHex";

/** См. site-runtime ContentList: отличаем первый запуск эффекта от смены категории, чтобы не дублировать fetch при SSR-кэше «Все». */
const CATEGORY_FETCH_INIT = Symbol("categoryFetchInit");

type CellLayoutMode = "block" | "flex" | "absolute";

interface ContentListProps {
  /**
   * Строка группы с CategoryFilter: общий ключ кэша `getCollectionItemsCacheKey` и источник `categoryIds` в запросе.
   */
  filterScope?: string;
  selectedSource?: string;
  itemsPerRow?: number;
  /** при "grid" с API считаем это как flex (row + wrap). временно  */
  cellLayout?: CellLayoutMode | "grid";
  cellGap?: number | null;
  cellFlexFlow?: "row" | "column" | "wrap" | null;
  cellFlexJustifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | null;
  cellFlexAlignItems?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "stretch"
    | "baseline"
    | null;
  cellPlaceItemsY?: "start" | "center" | "end" | "stretch" | "baseline" | null;
  cellPlaceItemsX?: "start" | "center" | "end" | "stretch" | "baseline" | null;
  borderRadius?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderColor?: string;
  borderStyle?: "none" | "solid" | "dotted";
  borderOpacity?: number;
  backgroundColor?: string;
  cellBackgroundColor?: string | null;
  opacityPercent?: number;
  cellOpacityPercent?: number | null;
  children?: ComponentNode[];
}

/**
 * Список коллекции с опциональным filterScope: при смене категории в контексте — refetch с `categoryIds`.
 * Stale-while-revalidate: при непустом списке показываем оверлей вместо скрытия контента.
 */
export const ContentList = ({
  filterScope,
  selectedSource = "",
  itemsPerRow: itemsPerRowProp,
  cellLayout = "block",
  cellGap,
  cellFlexFlow,
  cellFlexJustifyContent,
  cellFlexAlignItems,
  cellPlaceItemsY,
  cellPlaceItemsX,
  backgroundColor = "#FFFFFF",
  borderRadius = 4,
  borderTopWidth = 0,
  borderRightWidth = 0,
  borderBottomWidth = 0,
  borderLeftWidth = 0,
  borderColor = "#CBD5E0",
  borderStyle = "solid",
  borderOpacity = 1,
  cellBackgroundColor,
  opacityPercent,
  cellOpacityPercent = null,
  children: childrenProp,
}: ContentListProps) => {
  const listRootOpacityStyle = resolveCraftVisualEffectsRnStyle({
    opacityPercent,
  });

  const hasCustomBorder =
    borderTopWidth > 0 ||
    borderRightWidth > 0 ||
    borderBottomWidth > 0 ||
    borderLeftWidth > 0;

  const showBorder = hasCustomBorder && borderStyle !== "none";

  const effectiveListBorderColor = showBorder
    ? withOpacityHex(borderColor ?? "#CBD5E0", borderOpacity ?? 1)
    : "transparent";

  const listRootBorderStyle = {
    borderRadius,
    borderStyle: showBorder ? (borderStyle === "dotted" ? "dotted" as const : "solid" as const) : ("solid" as const),
    borderColor: effectiveListBorderColor,
    borderTopWidth: showBorder ? borderTopWidth : 0,
    borderRightWidth: showBorder ? borderRightWidth : 0,
    borderBottomWidth: showBorder ? borderBottomWidth : 0,
    borderLeftWidth: showBorder ? borderLeftWidth : 0,
  };

  const itemsPerRow: number = itemsPerRowProp ?? 1;
  const children: ComponentNode[] = childrenProp ?? [];
  const { domain, collectionItemsByKey, setItemsForKey } = useSiteCollections();
  const { selectedCategoryIdByScope } = useCollectionFilterScope();
  const scopeTrimmed = filterScope?.trim() ?? "";
  const selectedCategoryId = scopeTrimmed
    ? selectedCategoryIdByScope[scopeTrimmed] ?? null
    : null;

  const cacheKey = getCollectionItemsCacheKey(filterScope, selectedSource);
  const fromSsr = collectionItemsByKey[cacheKey];
  const [fallbackItems, setFallbackItems] = useState<IContentItem[] | null>(
    null,
  );
  // Нет scope: ждём коллекцию с клиента, если в SiteCollectionsProvider нет начальных items.
  const [fetchLoading, setFetchLoading] = useState(
    () =>
      !!selectedSource &&
      fromSsr === undefined &&
      !!domain,
  );
  // Есть scope: индикатор повторного запроса при смене категории (оверлей или блокирующий плейсхолдер).
  const [filterLoading, setFilterLoading] = useState(
    () =>
      !!scopeTrimmed &&
      !!selectedSource &&
      collectionItemsByKey[cacheKey] === undefined,
  );

  const prevCategoryRef = useRef<string | null | typeof CATEGORY_FETCH_INIT>(
    CATEGORY_FETCH_INIT,
  );

  // Новый scope/source — сбрасываем логику «первого захода» в эффекте категорий.
  useEffect(() => {
    prevCategoryRef.current = CATEGORY_FETCH_INIT;
  }, [filterScope, selectedSource]);

  // Refetch элементов при смене категории (или первичная загрузка для scope без готового кэша).
  useEffect(() => {
    if (!scopeTrimmed || !selectedSource || !domain) {
      return;
    }

    const cat = selectedCategoryId;

    if (prevCategoryRef.current === CATEGORY_FETCH_INIT) {
      prevCategoryRef.current = cat;
      if (cat === null && collectionItemsByKey[cacheKey] !== undefined) {
        return;
      }
    } else if (prevCategoryRef.current === cat) {
      return;
    } else {
      prevCategoryRef.current = cat;
    }

    let cancelled = false;
    setFilterLoading(true);
    fetchContentItems(domain, selectedSource, {
      categoryIds: cat ? [cat] : undefined,
    })
      .then((items) => {
        if (!cancelled && items != null) {
          setItemsForKey(cacheKey, items);
        }
      })
      .catch((error) => {
        console.error("Ошибка при загрузке коллекции с фильтром:", error);
      })
      .finally(() => {
        if (!cancelled) setFilterLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    scopeTrimmed,
    selectedSource,
    domain,
    selectedCategoryId,
    setItemsForKey,
    cacheKey,
    collectionItemsByKey[cacheKey],
  ]);

  // Режим без filterScope: клиентская подгрузка коллекции, если провайдер не передал initial items.
  useEffect(() => {
    if (scopeTrimmed) {
      return;
    }
    if (fromSsr !== undefined) {
      setFallbackItems(null);
      setFetchLoading(false);
      return;
    }
    if (!selectedSource || !domain) {
      setFallbackItems([]);
      setFetchLoading(false);
      return;
    }

    let cancelled = false;
    setFetchLoading(true);
    getCollectionByKey(domain, selectedSource)
      .then((collection) => {
        if (!cancelled) {
          setFallbackItems(collection?.items ?? []);
        }
      })
      .catch((error) => {
        console.error("Ошибка при загрузке коллекции:", error);
        if (!cancelled) setFallbackItems([]);
      })
      .finally(() => {
        if (!cancelled) setFetchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedSource, domain, fromSsr, cacheKey, scopeTrimmed]);

  const collectionItems: IContentItem[] =
    fromSsr !== undefined ? fromSsr : (fallbackItems ?? []);

  // Нечего показать и идёт загрузка — оставляем плейсхолдер (не смешиваем с filterLoading при уже видимых карточках).
  const blockingLoading =
    !!selectedSource &&
    collectionItems.length === 0 &&
    (filterLoading ||
      (!scopeTrimmed && fromSsr === undefined && fetchLoading));

  // Stale-while-revalidate: старые items остаются, поверх — затемнение до ответа API.
  const showFilterOverlay =
    filterLoading && collectionItems.length > 0;

  if (!selectedSource || blockingLoading) {
    return (
      <View
        style={[
          styles.placeholder,
          { backgroundColor },
          listRootBorderStyle,
          listRootOpacityStyle,
        ]}
        accessibilityState={blockingLoading ? { busy: true } : undefined}
      />
    );
  }

  if (collectionItems.length === 0) {
    return (
      <View
        style={[
          styles.placeholder,
          { backgroundColor },
          listRootBorderStyle,
          listRootOpacityStyle,
        ]}
      />
    );
  }

  const rows: IContentItem[][] = [];
  // Строки сетки: по `itemsPerRow` элементов в ряд (или одна колонка при itemsPerRow === 1).
  for (let i = 0; i < collectionItems.length; i += itemsPerRow) {
    rows.push(collectionItems.slice(i, i + itemsPerRow));
  }

  return (
    <ContentListProvider filterScope={scopeTrimmed || undefined}>
      <View
        style={[
          styles.listOuter,
          { backgroundColor },
          listRootBorderStyle,
          listRootOpacityStyle,
        ]}
        accessibilityState={filterLoading ? { busy: true } : undefined}
      >
        <View style={styles.root}>
          {rows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={[
                styles.row,
                { flexDirection: itemsPerRow === 1 ? "column" : "row" },
              ]}
            >
              {row.map((itemData, itemIndex) => {
                const flatIndex = rowIndex * itemsPerRow + itemIndex;
                return (
                  <ContentListItem
                    key={itemData.id || String(flatIndex)}
                    itemData={itemData}
                    collectionKey={selectedSource}
                    itemsPerRow={itemsPerRow}
                    layout={cellLayout}
                    gap={cellGap ?? undefined}
                    flexFlow={cellFlexFlow ?? undefined}
                    flexJustifyContent={cellFlexJustifyContent ?? undefined}
                    flexAlignItems={cellFlexAlignItems ?? undefined}
                    placeItemsY={cellPlaceItemsY ?? undefined}
                    placeItemsX={cellPlaceItemsX ?? undefined}
                    backgroundColor={cellBackgroundColor ?? undefined}
                    cellOpacityPercent={cellOpacityPercent ?? undefined}
                  >
                    {children}
                  </ContentListItem>
                );
              })}
            </View>
          ))}
        </View>
        {showFilterOverlay ? (
          <View
            style={styles.filterOverlay}
            pointerEvents="auto"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <ActivityIndicator size="small" color="#666666"/>
            <RNText style={styles.overlayHint}>Обновление…</RNText>
          </View>
        ) : null}
      </View>
    </ContentListProvider>
  );
};

interface ContentListItemProps {
  itemData: IContentItem;
  collectionKey: string | null;
  itemsPerRow: number;
  layout?: "block" | "flex" | "absolute" | "grid";
  gap?: number;
  flexFlow?: "row" | "column" | "wrap";
  flexJustifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around";
  flexAlignItems?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "stretch"
    | "baseline";
  placeItemsY?: "start" | "center" | "end" | "stretch" | "baseline";
  placeItemsX?: "start" | "center" | "end" | "stretch" | "baseline";
  backgroundColor?: string;
  cellOpacityPercent?: number;
  children: ComponentNode[];
}

const toAlignItems = (
  v?: "start" | "center" | "end" | "stretch" | "baseline",
): "flex-start" | "center" | "flex-end" | "stretch" | "baseline" | undefined => {
  if (!v) return undefined;
  if (v === "start") return "flex-start";
  if (v === "end") return "flex-end";
  return v;
};

const toJustifyContent = (
  v?: "start" | "center" | "end" | "stretch" | "baseline",
): "flex-start" | "center" | "flex-end" | undefined => {
  if (!v || v === "stretch" || v === "baseline") return undefined;
  if (v === "start") return "flex-start";
  if (v === "end") return "flex-end";
  return v;
};

const ContentListItem = ({
  itemData,
  collectionKey,
  itemsPerRow,
  layout = "block",
  gap,
  flexFlow = "row",
  flexJustifyContent,
  flexAlignItems,
  placeItemsY,
  placeItemsX,
  backgroundColor: cellBg,
  cellOpacityPercent,
  children,
}: ContentListItemProps) => {
  const cellOpacityStyle = resolveCraftVisualEffectsRnStyle({
    opacityPercent: cellOpacityPercent,
  });
  const effectiveLayout = layout === "grid" ? "flex" : layout;
  const isFlex = effectiveLayout === "flex";

  const hasTemplate = children && children.length > 0;

  const flexDirection = isFlex
    ? layout === "grid"
      ? "row"
      : flexFlow === "column"
        ? "column"
        : "row"
    : "column";
  const flexWrap =
    isFlex && (layout === "grid" || flexFlow === "wrap") ? "wrap" : "nowrap";
  const alignItems =
    isFlex && flexAlignItems != null
      ? flexAlignItems
      : (toAlignItems(placeItemsY) ?? undefined);
  const justifyContent =
    isFlex && flexJustifyContent != null
      ? flexJustifyContent
      : (toJustifyContent(placeItemsX) ?? undefined);

  return (
    <ContentDataProvider collectionKey={collectionKey} itemData={itemData}>
      <View
        style={[
          styles.item,
          {
            flex: itemsPerRow === 1 ? 0 : 1,
            flexDirection,
            flexWrap,
            gap: gap != null && gap >= 0 ? gap : undefined,
            alignItems: alignItems ?? undefined,
            justifyContent: justifyContent ?? undefined,
            ...(cellBg ? { backgroundColor: cellBg } : {}),
            ...cellOpacityStyle,
          },
        ]}
      >
        {hasTemplate
          ? children.map((child, index) => (
            <React.Fragment key={index}>
              {renderComponent(child)}
            </React.Fragment>
          ))
          : (
            <RNText style={{ color: "#999999", fontSize: 12 }}>
              No template
            </RNText>
          )}
      </View>
    </ContentDataProvider>
  );
};

const styles = StyleSheet.create({
  listOuter: {
    position: "relative",
    width: "100%",
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayHint: {
    marginTop: 8,
    fontSize: 14,
    color: "#666666",
  },
  root: {
    width: "100%",
    flexDirection: "column",
  },
  row: {
    width: "100%",
  },
  item: {
    minHeight: 48,
    padding: 16,
  },
  placeholder: {
    width: "100%",
    minHeight: 300,
  },
});
