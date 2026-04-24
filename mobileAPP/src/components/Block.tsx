import type { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { useResponsiveViewport } from "../contexts/ResponsiveViewportContext";
import {
  resolveResponsiveStyle,
} from "../content/responsiveStyle";

type BlockLayoutMode = "block" | "flex" | "absolute"; //TODO должен быть только flex

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

  const backgroundColor =
    rs.backgroundColor != null && rs.backgroundColor !== ""
      ? String(rs.backgroundColor)
      : "#FFFFFF";


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
            backgroundColor,
         ...rs,
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
