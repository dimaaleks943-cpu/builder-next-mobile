import { RESPONSIVE_STYLE_BRANCHES, type ResponsiveStyle } from "../../content/responsiveStyle";

export const mergeResponsiveStyles = (
  ...layers: (ResponsiveStyle | undefined)[]
): ResponsiveStyle => {
  const merged: ResponsiveStyle = {};
  for (const layer of layers) {
    if (!layer) continue;
    for (const branch of RESPONSIVE_STYLE_BRANCHES) {
      const branchStyle = layer[branch];
      if (!branchStyle || typeof branchStyle !== "object") continue;
      merged[branch] = {
        ...(merged[branch] ?? {}),
        ...branchStyle,
      };
    }
  }
  return merged;
};
