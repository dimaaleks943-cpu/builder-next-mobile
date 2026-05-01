import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchContentCategories } from "../api/categoriesApi";
import type { ContentCategory } from "../api/contentTypes";
import { useCollectionFilterScope } from "../contexts/CollectionFilterScopeContext";
import { useStorefrontPage } from "../contexts/StorefrontPageContext";
import { useSiteCollections } from "../contexts/SiteCollectionsContext";
import { buildStorefrontCategoryUrl } from "../lib/catalogPathResolve";
import { useResponsiveViewport } from "../contexts/ResponsiveViewportContext";
import { resolveResponsiveStyle } from "../content/responsiveStyle";
import { resolveCraftVisualEffectsRnStyle } from "../lib/craftVisualEffectsRn";

/** Настройки блока с сервера; `filterScope` связывает фильтр с ContentList. */
export type CategoryFilterProps = {
  style?: any;
  filterScope: string;
  /** UUID корня дерева категорий — в API уходит `filter` с `category_id`. */
  contentCategoryRootId?: string;
  variant?: "buttons" | "radio" | "list";
  direction?: "row" | "column";
  showAllLabel?: string;
};

/** Рендер кнопок/радио категорий и запись выбора в `CollectionFilterScope` для связанных списков. */
export const CategoryFilter = ({
  style,
  filterScope,
  contentCategoryRootId = "",
  variant = "buttons",
  direction = "row",
  showAllLabel = "Все",
}: CategoryFilterProps) => {
  const { viewport } = useResponsiveViewport();
  const rs = resolveResponsiveStyle(style, viewport);
  const backgroundColor =
    rs.backgroundColor != null && rs.backgroundColor !== ""
      ? String(rs.backgroundColor)
      : "#FFFFFF";
  const rawOpacity = rs.opacityPercent;
  const opacityPercent =
    typeof rawOpacity === "number" && Number.isFinite(rawOpacity)
      ? rawOpacity
      : typeof rawOpacity === "string" && rawOpacity.trim() !== ""
        ? Number(rawOpacity)
        : undefined;
  const opacityEffects =
    opacityPercent !== undefined && Number.isFinite(opacityPercent)
      ? resolveCraftVisualEffectsRnStyle({ opacityPercent })
      : {};

  const navigation = useNavigation<any>();
  const { domain } = useSiteCollections();
  const { pageBaseSlug, previewParams } = useStorefrontPage();
  const { selectedCategoryIdByScope, setCategoryForScope } =
    useCollectionFilterScope();
  const scope = filterScope.trim();
  const selectedId = scope ? selectedCategoryIdByScope[scope] ?? null : null;
  const rootId = contentCategoryRootId.trim();
  const rootMissing = !rootId;

  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(() => Boolean(rootId));

  // Опции фильтра: плоский список категорий под корнем из пропсов блока.
  useEffect(() => {
    if (!domain || !rootId) {
      setCategories([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchContentCategories(domain, {
      categoryRootId: rootId,
      limit: 500,
    })
      .then((data) => {
        if (!cancelled) setCategories(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [domain, rootId]);

  const onSelectAll = useCallback(() => {
    if (scope) {
      setCategoryForScope(scope, null);
      navigation.navigate("Page", {
        slug: pageBaseSlug && pageBaseSlug !== "/" ? pageBaseSlug : "/",
        previewParams,
      });
    }
  }, [scope, setCategoryForScope, navigation, pageBaseSlug, previewParams]);

  /** Выбор категории: state + навигация на slug-URL как на SSR. */
  const onSelectCategory = useCallback(
    (id: string, categorySlug?: string | null) => {
      if (!scope) return;
      const s = categorySlug?.trim() || null;
      setCategoryForScope(scope, id, s ?? undefined);
      if (s) {
        navigation.navigate("Page", {
          slug: buildStorefrontCategoryUrl(pageBaseSlug, s),
          previewParams,
        });
      }
    },
    [scope, setCategoryForScope, navigation, pageBaseSlug, previewParams],
  );

  if (!scope) {
    return null;
  }

  const isList = variant === "list";
  const isRadio = variant === "radio";
  const row = direction === "row";

  const sorted = categories
    .slice()
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)); // порядок как в CMS (поле sort)

  return (
    <View
      style={[
        styles.nav,
        row ? styles.navRow : styles.navCol,
        { backgroundColor },
        opacityEffects,
      ]}
      accessibilityRole="none"
    >
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" />
          <Text style={styles.muted}>Загрузка…</Text>
        </View>
      ) : rootMissing ? (
        <Text style={styles.hint}>
          Укажите ID корня категорий в настройках блока для загрузки списка.
        </Text>
      ) : (
        <>
          {isRadio ? (
            <Pressable
              onPress={onSelectAll}
              style={({ pressed }) => [
                styles.baseItem,
                styles.radioRow,
                isList && styles.listItem,
                selectedId === null && styles.activeItem,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.radioOuter}>
                {selectedId === null ? <View style={styles.radioInner} /> : null}
              </View>
              <Text style={styles.itemLabel}>{showAllLabel}</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={onSelectAll}
              style={({ pressed }) => [
                styles.baseItem,
                isList && styles.listItem,
                selectedId === null && styles.activeItem,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.itemLabel}>{showAllLabel}</Text>
            </Pressable>
          )}
          {sorted.map((cat) => {
            const active = selectedId !== null && selectedId === cat.id;
            if (isRadio) {
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => onSelectCategory(cat.id, cat.slug)}
                  style={({ pressed }) => [
                    styles.baseItem,
                    styles.radioRow,
                    isList && styles.listItem,
                    active && styles.activeItem,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.radioOuter}>
                    {active ? <View style={styles.radioInner} /> : null}
                  </View>
                  <Text style={styles.itemLabel}>{cat.name}</Text>
                </Pressable>
              );
            }
            return (
              <Pressable
                key={cat.id}
                onPress={() => onSelectCategory(cat.id, cat.slug)}
                style={({ pressed }) => [
                  styles.baseItem,
                  isList && styles.listItem,
                  active && styles.activeItem,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.itemLabel}>{cat.name}</Text>
              </Pressable>
            );
          })}
        </>
      )}
    </View>
  );
};

CategoryFilter.displayName = "CategoryFilter";

const styles = StyleSheet.create({
  nav: {
    marginBottom: 16,
  },
  navRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  navCol: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 6,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  muted: {
    fontSize: 14,
    color: "#888888",
  },
  hint: {
    fontSize: 13,
    color: "#888888",
  },
  baseItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#CCCCCC",
    backgroundColor: "#F5F5F5",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  listItem: {
    width: "100%",
    marginBottom: 4,
  },
  activeItem: {
    borderColor: "#333333",
    backgroundColor: "#E8E8E8",
  },
  pressed: {
    opacity: 0.85,
  },
  itemLabel: {
    fontSize: 14,
    color: "#111111",
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#666666",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#333333",
  },
});
