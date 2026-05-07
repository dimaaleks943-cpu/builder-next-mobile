/** Цвет уже содержит альфу (rgba / hsla / #RRGGBBAA) — используем как есть. */
export const borderColorHasIntrinsicAlpha = (color: string): boolean => {
  const s = color.trim();
  return (
    /^\s*rgba\s*\(/i.test(s) ||
    /^\s*hsla\s*\(/i.test(s) ||
    /^#([a-f\d]{8})$/i.test(s)
  );
};

/** 6-digit `#RRGGBB` → `#RRGGBBAA` for React Native borders (no CSS `opacity` on border alone). */
export const withOpacityHex = (color: string, opacity: number): string => {
  const normalized = color.startsWith("#") ? color.slice(1) : color;
  if (normalized.length !== 6) return color;
  const alpha = Math.round(Math.min(Math.max(opacity, 0), 1) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${normalized}${alpha}`;
};
