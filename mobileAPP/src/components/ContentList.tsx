import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text as RNText,
  ActivityIndicator,
  type ViewStyle,
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
import { useResponsiveViewport } from "../contexts/ResponsiveViewportContext";
import { useSiteCollections } from "../contexts/SiteCollectionsContext";
import { getCollectionItemsCacheKey } from "../lib/collectionItemsCacheKey";
import { renderComponent } from "../content/renderer";
import {
  pickResolvedNumber,
  resolveResponsiveStyle,
  type Viewport,
} from "../content/responsiveStyle";
import { resolveCraftVisualEffectsRnStyle } from "../lib/craftVisualEffectsRn";
import { isFlexDisplay, isGridDisplay } from "../utils/layoutDisplayDerived";
import { flexFlowToRn } from "../utils/flexFlowRn";
import { borderColorHasIntrinsicAlpha, withOpacityHex } from "../lib/withOpacityHex";

const CATEGORY_FETCH_INIT = Symbol("categoryFetchInit");

interface ContentListProps {
  /**
   * Строка группы с CategoryFilter: общий ключ кэша `getCollectionItemsCacheKey` и источник `categoryIds` в запросе.
   */
  filterScope?: string;
  selectedSource?: string;
  /** Responsive стили корня списка (ветки `desktop` / `tablet` / …), включая `itemsPerRow`, рамки, фон. */
  style?: unknown;
  /** Вложенный responsive `style` шаблонной ячейки (из craft); display/gap/flex читаются после `resolveResponsiveStyle`. */
  cellTemplateStyle?: unknown;
  cellNodeId?: string;
  nativeID?: string;
  children?: ComponentNode[];
}

/**
 * Список коллекции с опциональным filterScope: при смене категории в контексте — refetch с `categoryIds`.
 * Stale-while-revalidate: при непустом списке показываем оверлей вместо скрытия контента.
 */
export const ContentList = ({
  filterScope,
  selectedSource = "",
  style,
  cellTemplateStyle,
  cellNodeId,
  nativeID,
  children: childrenProp,
}: ContentListProps) => {
  const { viewport } = useResponsiveViewport();
  const listRs = useMemo(
    () => resolveResponsiveStyle(style, viewport),
    [style, viewport],
  );
  const mergedCellStyle = useMemo(
    () => resolveResponsiveStyle(cellTemplateStyle, viewport),
    [cellTemplateStyle, viewport],
  );

  const cellDisplay =
    (mergedCellStyle.display as string | undefined) ?? "block";
  const rawCellGap =
    mergedCellStyle.gap == null
      ? null
      : typeof mergedCellStyle.gap === "number"
        ? mergedCellStyle.gap
        : Number(mergedCellStyle.gap);
  const cellGap =
    rawCellGap != null && Number.isFinite(rawCellGap) ? rawCellGap : null;
  const cellFlexFlow =
    mergedCellStyle.flexFlow == null
      ? undefined
      : String(mergedCellStyle.flexFlow);
  const cellJustifyContent =
    mergedCellStyle.justifyContent == null
      ? undefined
      : (mergedCellStyle.justifyContent as
          | "flex-start"
          | "flex-end"
          | "center"
          | "space-between"
          | "space-around");
  const cellAlignItems =
    mergedCellStyle.alignItems == null
      ? undefined
      : (mergedCellStyle.alignItems as
          | "flex-start"
          | "flex-end"
          | "center"
          | "stretch"
          | "baseline");
  const cellPlaceItems =
    mergedCellStyle.placeItems == null
      ? undefined
      : String(mergedCellStyle.placeItems);
  const cellBackgroundColor =
    mergedCellStyle.backgroundColor == null
      ? undefined
      : String(mergedCellStyle.backgroundColor);
  const rawCellOpacity =
    mergedCellStyle.opacityPercent == null
      ? null
      : typeof mergedCellStyle.opacityPercent === "number"
        ? mergedCellStyle.opacityPercent
        : Number(mergedCellStyle.opacityPercent);
  const cellOpacityPercent =
    rawCellOpacity != null && Number.isFinite(rawCellOpacity)
      ? rawCellOpacity
      : undefined;

  const borderRadius = pickResolvedNumber(listRs, "borderRadius", 4);
  const borderTopWidth = pickResolvedNumber(listRs, "borderTopWidth", 0);
  const borderRightWidth = pickResolvedNumber(listRs, "borderRightWidth", 0);
  const borderBottomWidth = pickResolvedNumber(listRs, "borderBottomWidth", 0);
  const borderLeftWidth = pickResolvedNumber(listRs, "borderLeftWidth", 0);
  const borderColor =
    listRs.borderColor != null && listRs.borderColor !== ""
      ? String(listRs.borderColor)
      : "#CBD5E0";
  const borderStyle =
    (listRs.borderStyle as "none" | "solid" | "dotted" | undefined) ?? "solid";
  const borderOpacity = pickResolvedNumber(listRs, "borderOpacity", 1);
  const backgroundColor =
    listRs.backgroundColor != null && listRs.backgroundColor !== ""
      ? String(listRs.backgroundColor)
      : "#FFFFFF";
  const rawListOpacity = listRs.opacityPercent;
  const listOpacityPercent =
    typeof rawListOpacity === "number" && Number.isFinite(rawListOpacity)
      ? rawListOpacity
      : typeof rawListOpacity === "string" && rawListOpacity.trim() !== ""
        ? Number(rawListOpacity)
        : undefined;

  const listRootOpacityStyle =
    listOpacityPercent !== undefined && Number.isFinite(listOpacityPercent)
      ? resolveCraftVisualEffectsRnStyle({ opacityPercent: listOpacityPercent })
      : {};

  const hasCustomBorder =
    borderTopWidth > 0 ||
    borderRightWidth > 0 ||
    borderBottomWidth > 0 ||
    borderLeftWidth > 0;

  const showBorder = hasCustomBorder && borderStyle !== "none";

  const baseBorderColor = borderColor ?? "#CBD5E0";
  const effectiveListBorderColor = showBorder
    ? borderColorHasIntrinsicAlpha(baseBorderColor)
      ? baseBorderColor
      : withOpacityHex(baseBorderColor, borderOpacity ?? 1)
    : "transparent";

  const listRootBorderStyle: ViewStyle = {
    borderRadius,
    borderStyle: showBorder
      ? borderStyle === "dotted"
        ? "dotted"
        : "solid"
      : "solid",
    borderColor: effectiveListBorderColor,
    borderTopWidth: showBorder ? borderTopWidth : 0,
    borderRightWidth: showBorder ? borderRightWidth : 0,
    borderBottomWidth: showBorder ? borderBottomWidth : 0,
    borderLeftWidth: showBorder ? borderLeftWidth : 0,
  };

  const listRootBackgroundStyle: ViewStyle = {
    backgroundColor: backgroundColor ?? "#FFFFFF",
  };

  const itemsPerRow: number = pickResolvedNumber(listRs, "itemsPerRow", 1);
  const children: ComponentNode[] = childrenProp ?? [];
  const { domain, collectionItemsByKey, setItemsForKey } = useSiteCollections();
  const { selectedCategoryIdByScope } = useCollectionFilterScope();
  const scopeTrimmed = filterScope?.trim() ?? "";
  const selectedCategoryId = scopeTrimmed
    ? selectedCategoryIdByScope[scopeTrimmed] ?? null
    : null;

  const cacheKey = getCollectionItemsCacheKey(filterScope, selectedSource as string);
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
        nativeID={nativeID}
        style={[
          listRootBackgroundStyle,
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
        nativeID={nativeID}
        style={[
          listRootBackgroundStyle,
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
        nativeID={nativeID}
        style={[
          listRootBackgroundStyle,
          listRootBorderStyle,
          listRootOpacityStyle,
        ]}
        accessibilityState={filterLoading ? { busy: true } : undefined}
      >
        <View>
          {rows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={[
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
                    viewport={viewport}
                    display={cellDisplay}
                    gap={cellGap ?? undefined}
                    flexFlow={cellFlexFlow ?? undefined}
                    justifyContent={cellJustifyContent ?? undefined}
                    alignItems={cellAlignItems ?? undefined}
                    placeItems={cellPlaceItems ?? undefined}
                    backgroundColor={cellBackgroundColor}
                    cellOpacityPercent={cellOpacityPercent}
                    cellNodeId={cellNodeId}
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
            pointerEvents="auto"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <ActivityIndicator size="small" color="#666666"/>
            <RNText>Обновление…</RNText>
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
  viewport: Viewport;
  display?: string;
  gap?: number;
  flexFlow?: string;
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around";
  alignItems?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "stretch"
    | "baseline";
  /** CSS `place-items`: два токена через пробел, нап. `stretch start`. */
  placeItems?: string;
  backgroundColor?: string;
  cellOpacityPercent?: number;
  cellNodeId?: string;
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

const parsePlaceItemsTokens = (
  raw?: string,
): { py?: "start" | "center" | "end" | "stretch" | "baseline"; px?: "start" | "center" | "end" | "stretch" | "baseline" } => {
  if (!raw?.trim()) return {}
  const parts = raw.trim().split(/\s+/)
  return {
    py: parts[0] as "start" | "center" | "end" | "stretch" | "baseline",
    px: (parts[1] ?? parts[0]) as "start" | "center" | "end" | "stretch" | "baseline",
  }
}

const ContentListItem = ({
  itemData,
  collectionKey,
  itemsPerRow,
  viewport,
  display = "block",
  gap,
  flexFlow = "row",
  justifyContent: propJustifyContent,
  alignItems: propAlignItems,
  placeItems,
  backgroundColor: cellBg,
  cellOpacityPercent,
  cellNodeId,
  children,
}: ContentListItemProps) => {
  const cellOpacityStyle = resolveCraftVisualEffectsRnStyle({
    opacityPercent: cellOpacityPercent,
  });
  const isGridLayout = isGridDisplay(display);
  const isFlexLayout = isFlexDisplay(display) || isGridLayout;
  const hasTemplate = children && children.length > 0;

  const { flexDirection: ffDir, flexWrap: ffWrap } = flexFlowToRn(flexFlow);

  const flexDirection = isFlexLayout
    ? isGridLayout
      ? "row"
      : ffDir
    : "column";
  const flexWrap = !isFlexLayout
    ? "nowrap"
    : isGridLayout
      ? "wrap"
      : ffWrap;
  const { py: placeY, px: placeX } = parsePlaceItemsTokens(placeItems)
  const alignItems =
    isFlexLayout && propAlignItems != null
      ? propAlignItems
      : (toAlignItems(placeY) ?? undefined);
  const justifyContent =
    isFlexLayout && propJustifyContent != null
      ? propJustifyContent
      : (toJustifyContent(placeX) ?? undefined);

  return (
    <ContentDataProvider collectionKey={collectionKey} itemData={itemData}>
      <View
        nativeID={cellNodeId}
        style={[
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
              {renderComponent(child, viewport)}
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

