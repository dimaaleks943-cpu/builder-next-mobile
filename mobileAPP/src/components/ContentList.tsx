import React from "react";
import { View, StyleSheet, Text as RNText } from "react-native";
import type { ComponentNode } from "../runtime/interface";
import { getCollectionByKey } from "../api/collectionsApi";
import { ContentDataProvider } from "./ContentDataContext";
import { renderComponent } from "../runtime/renderer";

type CellLayoutMode = "block" | "flex" | "grid" | "absolute";

interface ContentListProps {
  selectedSource?: string;
  itemsPerRow?: number;
  cellLayout?: CellLayoutMode;
  cellGridColumns?: number;
  cellGridRows?: number;
  cellGridAutoFlow?: "row" | "column" | null;
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
  const itemsPerRow: number = itemsPerRowProp ?? 1;
  const children: ComponentNode[] = childrenProp ?? [];
  const [collectionItems, setCollectionItems] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!selectedSource) {
      setCollectionItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getCollectionByKey(selectedSource)
      .then((collection) => {
        if (collection) {
          setCollectionItems(collection.items || []);
        } else {
          setCollectionItems([]);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("[mobileApp] Ошибка при загрузке коллекции:", error);
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

  const rows: any[][] = [];
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
            );
          })}
        </View>
      ))}
    </View>
  );
};

interface ContentListItemProps {
  itemData: any;
  collectionKey: string | null;
  itemsPerRow: number;
  layout?: "block" | "flex" | "grid" | "absolute";
  gridColumns?: number;
  gridRows?: number;
  gridAutoFlow?: "row" | "column";
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
  const isGrid = layout === "grid";
  const isFlex = layout === "flex";

  const hasTemplate = children && children.length > 0;

  const flexDirection = isFlex
    ? flexFlow === "column"
      ? "column"
      : "row"
    : isGrid
      ? gridAutoFlow === "column"
        ? "column"
        : "row"
      : "column";
  const flexWrap = isGrid ? "wrap" : isFlex && flexFlow === "wrap" ? "wrap" : "nowrap";
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
    boxSizing: "border-box" as any,
  },
  placeholder: {
    width: "100%",
    minHeight: 300,
  },
});

