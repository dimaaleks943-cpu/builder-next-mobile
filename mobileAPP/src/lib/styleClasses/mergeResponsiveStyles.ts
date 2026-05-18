import type { ResponsiveStyle } from "../../content/responsiveStyle";

export const mergeResponsiveStyles = (
  ...layers: (ResponsiveStyle | undefined)[]
): ResponsiveStyle => {
  const result: ResponsiveStyle = {};

  for (const layer of layers) {
    if (!layer) continue;
    for (const [branch, branchStyle] of Object.entries(layer)) {
      if (!branchStyle || typeof branchStyle !== "object") continue;
      result[branch as keyof ResponsiveStyle] = {
        ...(result[branch as keyof ResponsiveStyle] ?? {}),
        ...branchStyle,
      };
    }
  }

  return result;
};
