import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text as RNText } from "react-native";
import type { ComponentNode } from "../content/interface";
import { getCollectionByKey } from "../api/collectionsApi";
import { SITE_DOMAIN } from "../api/config";
import type { IContentItem } from "../api/contentTypes";
import { ContentDataProvider } from "../contexts/ContentDataContext";
import { renderComponent } from "../content/renderer";

type CellLayoutMode = "block" | "flex" | "absolute";

interface ContentListProps {
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
  children?: ComponentNode[];
}
//TODO проверить не добавляем ли мы случайно грид в конструкторе, проверсти рефакторинг убрать грид
export const ContentList = ({
  selectedSource = "",
  itemsPerRow: itemsPerRowProp,
  cellLayout = "block",
  cellGap,
  cellFlexFlow,
  cellFlexJustifyContent,
  cellFlexAlignItems,
  cellPlaceItemsY,
  cellPlaceItemsX,
  children: childrenProp,
}: ContentListProps) => {
  const itemsPerRow: number = itemsPerRowProp ?? 1;
  const children: ComponentNode[] = childrenProp ?? [];
  const [collectionItems, setCollectionItems] = useState<IContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedSource) {
      setCollectionItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getCollectionByKey(SITE_DOMAIN, selectedSource)
      .then((collection) => {
        if (collection) {
          setCollectionItems(collection.items || []);
        } else {
          setCollectionItems([]);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        setCollectionItems([]);
        setIsLoading(false);
      });
  }, [selectedSource]);

  if (!selectedSource || isLoading) {
    return <View style={styles.placeholder} />;
  }

  if (collectionItems.length === 0) {
    return <View style={styles.placeholder} />;
  }

  const rows: IContentItem[][] = [];
  for (let i = 0; i < collectionItems.length; i += itemsPerRow) {
    rows.push(collectionItems.slice(i, i + itemsPerRow));
  }
  return (
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
              >
                {children}
              </ContentListItem>
            );
          })}
        </View>
      ))}
    </View>
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
  children,
}: ContentListItemProps) => {
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
  const flexWrap = isFlex && (layout === "grid" || flexFlow === "wrap") ? "wrap" : "nowrap";
  const alignItems = isFlex && flexAlignItems != null
    ? flexAlignItems
    : (toAlignItems(placeItemsY) ?? undefined);
  const justifyContent = isFlex && flexJustifyContent != null
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

