import type { ViewStyle } from "react-native";

export type CraftVisualEffectsSerializedProps = {
  opacityPercent?: number;
};

/** в RN используем только opacity (0–1) из opacityPercent */
export function resolveCraftVisualEffectsRnStyle(
  input: CraftVisualEffectsSerializedProps,
): Pick<ViewStyle, "opacity"> {
  if (typeof input.opacityPercent !== "number" || Number.isNaN(input.opacityPercent)) {
    return {};
  }
  const opacity = Math.min(100, Math.max(0, input.opacityPercent)) / 100;
  return { opacity };
}
