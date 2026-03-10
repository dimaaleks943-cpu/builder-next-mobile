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
  placeItemsY,
  placeItemsX,
  children,
}: ContentListItemProps) => {
  const isGrid = layout === "grid";
  const isFlex = layout === "flex";

  const hasTemplate = children && children.length > 0;

  return (
    <ContentDataProvider collectionKey={collectionKey} itemData={itemData}>
      <View
        style={[
          styles.item,
          {
            flex: itemsPerRow === 1 ? 0 : 1,
            flexDirection: isGrid || isFlex ? (gridAutoFlow === "column" ? "column" : "row") : "column",
            flexWrap: isGrid ? "wrap" : "nowrap",
            gap: gap != null && gap >= 0 ? gap : undefined,
            alignItems: toAlignItems(placeItemsY),
            justifyContent: toJustifyContent(placeItemsX),
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

