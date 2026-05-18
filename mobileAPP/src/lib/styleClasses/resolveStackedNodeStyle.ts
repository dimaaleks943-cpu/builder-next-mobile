import type { ResponsiveStyle } from "../../content/responsiveStyle";
import { buildComboClassId } from "./comboClassId";
import { mergeResponsiveStyles } from "./mergeResponsiveStyles";
import type { StyleClassesRegistry } from "./types";

export const resolveStackedNodeStyle = (
  styleClassIds: readonly string[],
  localStyle: ResponsiveStyle | undefined,
  classes: StyleClassesRegistry,
): ResponsiveStyle | undefined => {
  if (styleClassIds.length === 0) {
    return localStyle;
  }

  const memberLayers = [...styleClassIds]
    .reverse()
    .map((id) => classes[id]?.style);

  let merged = mergeResponsiveStyles(...memberLayers);

  if (styleClassIds.length >= 2) {
    const comboId = buildComboClassId(styleClassIds);
    merged = mergeResponsiveStyles(merged, classes[comboId]?.style);
  }

  return merged;
};
