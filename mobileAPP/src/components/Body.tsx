import type { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { useResponsiveViewport } from "../contexts/ResponsiveViewportContext";
import { resolveResponsiveStyle } from "../content/responsiveStyle";
import { resolveCraftVisualEffectsRnStyle } from "../lib/craftVisualEffectsRn";

interface BodyProps {
  style?: unknown;
  children?: ReactNode;
}

export const Body = ({ children, style }: BodyProps) => {
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

  return (
    <View
      style={[
        styles.root,
        { backgroundColor },
        opacityEffects,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
  },
});
