import type { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { useResponsiveViewport } from "../contexts/ResponsiveViewportContext";
import {
  resolveResponsiveStyle,
} from "../content/responsiveStyle";
import { isFlexDisplay, isGridDisplay } from "../utils/layoutDisplayDerived";
import { flexFlowToRn } from "../utils/flexFlowRn";
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
  style?: unknown;
  children?: ReactNode;
  nativeID?: string;
  testID?: string;
}

export const Block = ({
  children,
  style,
  nativeID,
  testID,
}: BlockProps) => {
  const { viewport } = useResponsiveViewport();
  const rs = resolveResponsiveStyle(style, viewport) as Record<string, unknown>;

  const fullSize = Boolean(rs.fullSize);
  const display = (rs.display as string | undefined) ?? "block";
  const flexFlow = (rs.flexFlow as string | undefined) ?? "row";
  const justifyContent = rs.justifyContent as FlexJustifyContent
  const alignItems = rs.alignItems as FlexAlignItems
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

  const isGridLayout = isGridDisplay(display);
  const isFlexLayout = isFlexDisplay(display) || isGridLayout;
  const { flexDirection: ffDir, flexWrap: ffWrap } = flexFlowToRn(flexFlow);

  const flexDirection = isFlexLayout
    ? isGridLayout
      ? "row"
      : ffDir
    : "row";

  const flexWrap = !isFlexLayout
    ? "nowrap"
    : isGridLayout
      ? "wrap"
      : ffWrap;
  const positionRaw = (rs.position as string | undefined) ?? "relative";
  const position = positionRaw === "absolute" ? "absolute" : "relative";
  const shadowStyle = fullSize
    ? {}
    : {
        shadowColor: "#000000",
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      };

  const gapStyle = isFlexLayout && gap != null && gap >= 0 ? { gap } : {};

  return (
    <View
      nativeID={nativeID}
      testID={testID}
      style={[
        styles.block,
        shadowStyle,
        {
          flexDirection,
          flexWrap,
          position,
          ...(isFlexLayout && justifyContent != null && { justifyContent }),
          ...(isFlexLayout && alignItems != null && { alignItems }),
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
