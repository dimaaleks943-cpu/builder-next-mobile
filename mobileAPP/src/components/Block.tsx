import type { ReactNode } from "react";
import { View, StyleSheet } from "react-native";

type BlockLayoutMode = "block" | "flex" | "grid" | "absolute";

interface BlockProps {
  children?: ReactNode;
  fullSize?: boolean;
  layout?: BlockLayoutMode;
  gridColumns?: number;
  gridRows?: number;
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
  gridColumns,
  gridRows,
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

  // Имитация поведения веб-Block:
  // - layout="block" → дети в строку (как inline в div), при переполнении могут переноситься.
  // - layout="flex"  → горизонтальный flex-ряд.
  // - layout="grid"  → сетка через flex-wrap (будет доработана вместе с gridColumns/gridRows).
  const flexDirection =
    layout === "block" || layout === "flex" || layout === "grid"
      ? "row"
      : "column";

  const flexWrap =
    layout === "grid" ? "wrap" : "nowrap";

  const position = layout === "absolute" ? "absolute" : "relative";

  const shadowStyle = fullSize
    ? {}
    : {
        shadowColor: "#000000",
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      };

  return (
    <View
      style={[
        styles.block,
        shadowStyle,
        {
          flexDirection,
          flexWrap,
          position,
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
  block: {
    boxSizing: "border-box" as any,
  },
});

