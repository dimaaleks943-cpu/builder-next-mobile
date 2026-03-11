import type { ReactNode } from "react";
import { View, StyleSheet } from "react-native";

type BlockLayoutMode = "block" | "flex" | "absolute";

type FlexFlowOption = "row" | "column" | "wrap";
type FlexJustifyContent =
  | "flex-start"
  | "center"
  | "flex-end"
  | "space-between"
  | "space-around";
type FlexAlignItems =
  | "flex-start"
  | "center"
  | "flex-end"
  | "stretch"
  | "baseline";

interface BlockProps {
  children?: ReactNode;
  fullSize?: boolean;
  layout?: BlockLayoutMode;
  flexFlow?: FlexFlowOption;
  flexJustifyContent?: FlexJustifyContent;
  flexAlignItems?: FlexAlignItems;
  gap?: number;
  // margins
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  // paddings
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  // borders
  borderRadius?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderColor?: string;
  borderStyle?: "none" | "solid" | "dashed";
  borderOpacity?: number; // 0–1
  backgroundColor?: string;
}

// Простейшее применение opacity к hex‑цвету вида #RRGGBB
const withOpacity = (color: string, opacity: number): string => {
  const normalized = color.startsWith("#") ? color.slice(1) : color;
  if (normalized.length !== 6) return color;
  const alpha = Math.round(Math.min(Math.max(opacity, 0), 1) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${normalized}${alpha}`;
};

export const Block = ({
  children,
  fullSize,
  layout = "block",
  flexFlow = "row",
  flexJustifyContent,
  flexAlignItems,
  gap,
  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  marginLeft = 0,
  paddingTop = 0,
  paddingRight = 0,
  paddingBottom = 0,
  paddingLeft = 0,
  borderRadius = 0,
  borderTopWidth = 0,
  borderRightWidth = 0,
  borderBottomWidth = 0,
  borderLeftWidth = 0,
  borderColor = "#CBD5E0",
  borderStyle = "solid",
  borderOpacity = 1,
  backgroundColor = "#FFFFFF",
}: BlockProps) => {
  const hasCustomBorder =
    borderTopWidth > 0 ||
    borderRightWidth > 0 ||
    borderBottomWidth > 0 ||
    borderLeftWidth > 0;

  const effectiveBorderColor = hasCustomBorder
    ? withOpacity(borderColor, borderOpacity)
    : "transparent";

  /** при layout="flex" направление и выравнивание задаются flexFlow, flexJustifyContent, flexAlignItems.
   *  "grid" трактуем как flex (row + wrap). TODO по идем приходить grid не должен, это престраховка */
  const effectiveLayout = layout === "grid" ? "flex" : layout;
  const isFlex = effectiveLayout === "flex";
  const flexDirection =
    effectiveLayout === "absolute"
      ? "column"
      : isFlex
        ? layout === "grid"
          ? "row"
          : flexFlow === "column"
            ? "column"
            : "row"
        : "row";

  const flexWrap = isFlex && flexFlow === "wrap" ? "wrap" : "nowrap";
  const position = effectiveLayout === "absolute" ? "absolute" : "relative";
  const shadowStyle = fullSize
    ? {}
    : {
        shadowColor: "#000000",
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      };

  const gapStyle = isFlex && gap != null && gap >= 0 ? { gap } : {};

  return (
    <View
      style={[
        styles.block,
        shadowStyle,
        {
          flexDirection,
          flexWrap,
          position,
          ...(isFlex && flexJustifyContent != null && { justifyContent: flexJustifyContent }),
          ...(isFlex && flexAlignItems != null && { alignItems: flexAlignItems }),
          ...gapStyle,
          width: fullSize ? "100%" : undefined,
          height: fullSize ? "100%" : undefined,
          marginTop,
          marginRight,
          marginBottom,
          marginLeft,
          paddingTop,
          paddingRight,
          paddingBottom,
          paddingLeft,
          borderRadius: fullSize ? 0 : borderRadius,
          borderStyle: hasCustomBorder ? (borderStyle || "solid") : "solid",
          borderColor: effectiveBorderColor,
          borderTopWidth: hasCustomBorder ? borderTopWidth : 0,
          borderRightWidth: hasCustomBorder ? borderRightWidth : 0,
          borderBottomWidth: hasCustomBorder ? borderBottomWidth : 0,
          borderLeftWidth: hasCustomBorder ? borderLeftWidth : 0,
          backgroundColor,
        },
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  block: {},
});

