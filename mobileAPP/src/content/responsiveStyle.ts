export type Viewport = "desktop" | "tablet" | "phone";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

/**
 * Breakpoints (width from `useWindowDimensions`):
 * - phone: <= 470
 * - tablet: <= 991
 * - desktop: > 991
 */
export const viewportFromWidth = (width: number): Viewport => {
  if (width <= 470) return "phone";
  if (width <= 991) return "tablet";
  return "desktop";
};

/**
 * Cascade: desktop = base; tablet = base + tablet; phone = base + tablet + phone.
 * Only `base` / `tablet` / `phone` branches are read; other keys are ignored.
 */
export const resolveResponsiveStyle = (
  style: unknown,
  viewport: Viewport,
): Record<string, unknown> => {
  if (!isPlainObject(style)) return {};

  const merged: Record<string, unknown> = {};
  const base = style.base;
  if (isPlainObject(base)) Object.assign(merged, base);

  if (viewport === "tablet" || viewport === "phone") {
    const tablet = style.tablet;
    if (isPlainObject(tablet)) Object.assign(merged, tablet);
  }

  if (viewport === "phone") {
    const phone = style.phone;
    if (isPlainObject(phone)) Object.assign(merged, phone);
  }

  return merged;
};

/**
 * Strips `props.style` and spreads merged flat style keys onto the returned props object.
 */
export const mergeNodePropsForViewport = (
  nodeProps: Record<string, any>,
  viewport: Viewport,
): Record<string, unknown> => {
  const { style, ...rest } = nodeProps;
  const resolved = resolveResponsiveStyle(style, viewport);
  return { ...rest, ...resolved };
};
