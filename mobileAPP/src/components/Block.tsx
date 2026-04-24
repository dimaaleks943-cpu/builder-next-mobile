import type { ReactNode } from "react";
import { View, StyleSheet, type DimensionValue } from "react-native";
import { useResponsiveViewport } from "../contexts/ResponsiveViewportContext";
import {
  pickResolvedNumber,
  resolveResponsiveStyle,
} from "../content/responsiveStyle";
import { resolveCraftVisualEffectsRnStyle } from "../lib/craftVisualEffectsRn";
import { withOpacityHex } from "../lib/withOpacityHex";

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
  style?: any;
  children?: ReactNode;
}

export const Block = ({ children, style }: BlockProps) => {
  const { viewport } = useResponsiveViewport();
  const rs = resolveResponsiveStyle(style, viewport);

  const fullSize = Boolean(rs.fullSize);
  const width = rs.width as string | number | undefined;
  const height = rs.height as string | number | undefined;
  const minHeight = rs.minHeight as string | number | undefined;
  const layout = (rs.layout as BlockLayoutMode | "grid" | undefined) ?? "block";
  const flexFlow = (rs.flexFlow as FlexFlowOption | undefined) ?? "row";
  const flexJustifyContent = rs.flexJustifyContent as
    | FlexJustifyContent
    | undefined;
  const flexAlignItems = rs.flexAlignItems as FlexAlignItems | undefined;
  const gapRaw = rs.gap;
  const gap =
    gapRaw == null
      ? undefined
      : typeof gapRaw === "number" && Number.isFinite(gapRaw)
        ? gapRaw
        : Number(gapRaw);

  const marginTop = pickResolvedNumber(rs, "marginTop", 0);
  const marginRight = pickResolvedNumber(rs, "marginRight", 0);
  const marginBottom = pickResolvedNumber(rs, "marginBottom", 0);
  const marginLeft = pickResolvedNumber(rs, "marginLeft", 0);
  const paddingTop = pickResolvedNumber(rs, "paddingTop", 0);
  const paddingRight = pickResolvedNumber(rs, "paddingRight", 0);
  const paddingBottom = pickResolvedNumber(rs, "paddingBottom", 0);
  const paddingLeft = pickResolvedNumber(rs, "paddingLeft", 0);
  const borderRadius = pickResolvedNumber(rs, "borderRadius", 0);
  const borderTopWidth = pickResolvedNumber(rs, "borderTopWidth", 0);
  const borderRightWidth = pickResolvedNumber(rs, "borderRightWidth", 0);
  const borderBottomWidth = pickResolvedNumber(rs, "borderBottomWidth", 0);
  const borderLeftWidth = pickResolvedNumber(rs, "borderLeftWidth", 0);
  const borderColor =
    rs.borderColor != null && rs.borderColor !== ""
      ? String(rs.borderColor)
      : "#CBD5E0";
  const borderStyle = (rs.borderStyle as "none" | "solid" | "dotted" | undefined) ?? "solid";
  const borderOpacity = pickResolvedNumber(rs, "borderOpacity", 1);
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

  const hasCustomBorder =
    borderTopWidth > 0 ||
    borderRightWidth > 0 ||
    borderBottomWidth > 0 ||
    borderLeftWidth > 0;

  const showBorder = hasCustomBorder && borderStyle !== "none";

  const effectiveBorderColor = showBorder
    ? withOpacityHex(borderColor ?? "#CBD5E0", borderOpacity ?? 1)
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

  const opacityEffects =
    opacityPercent !== undefined && Number.isFinite(opacityPercent)
      ? resolveCraftVisualEffectsRnStyle({ opacityPercent })
      : {};

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
          width: (fullSize ? "100%" : width) as DimensionValue | undefined,
          height: (fullSize ? "100%" : height) as DimensionValue | undefined,
          ...(!fullSize && minHeight !== undefined
            ? { minHeight: minHeight as DimensionValue }
            : {}),
          marginTop,
          marginRight,
          marginBottom,
          marginLeft,
          paddingTop,
          paddingRight,
          paddingBottom,
          paddingLeft,
          borderRadius: fullSize ? 0 : borderRadius,
          borderStyle: showBorder ? (borderStyle === "dotted" ? "dotted" : "solid") : "solid",
          borderColor: effectiveBorderColor,
          borderTopWidth: showBorder ? borderTopWidth : 0,
          borderRightWidth: showBorder ? borderRightWidth : 0,
          borderBottomWidth: showBorder ? borderBottomWidth : 0,
          borderLeftWidth: showBorder ? borderLeftWidth : 0,
          backgroundColor,
          ...opacityEffects,
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
