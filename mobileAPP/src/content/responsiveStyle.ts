export type Viewport =
  | "tablet_landscape"
  | "tablet"
  | "phone_landscape"
  | "phone";

/** Matches builder `PREVIEW_WIDTH_PHONE`: short side above this → tablet form factor. */
const PHONE_FORM_FACTOR_MAX_SHORT_SIDE = 568;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

/**
 * Cascade order: wider breakpoint branches first; later branches override (constructor contract).
 */
export const VIEWPORT_CASCADE: Viewport[] = [
  "tablet_landscape",
  "tablet",
  "phone_landscape",
  "phone",
];

const viewportCascadeDepth: Record<Viewport, number> = {
  tablet_landscape: 0,
  tablet: 1,
  phone_landscape: 2,
  phone: 3,
};

/**
 * Maps window dimensions to one of four responsive branches (no desktop/base).
 * Uses the shorter side to separate phone vs tablet form factor and orientation for *_landscape.
 */
export const viewportFromDimensions = (
  width: number,
  height: number,
): Viewport => {
  const shortSide = Math.min(width, height);
  const isLandscape = width > height;
  const isTabletFormFactor = shortSide > PHONE_FORM_FACTOR_MAX_SHORT_SIDE;

  if (isTabletFormFactor) {
    return isLandscape ? "tablet_landscape" : "tablet";
  }
  return isLandscape ? "phone_landscape" : "phone";
};

export const resolveResponsiveStyle = (
  style: unknown,
  viewport: Viewport,
): Record<string, unknown> => {
  if (!isPlainObject(style)) return {};

  const merged: Record<string, unknown> = {};
  const depth = viewportCascadeDepth[viewport];

  for (let i = 0; i <= depth; i++) {
    const branch = VIEWPORT_CASCADE[i];
    const branchStyle = style[branch];
    if (isPlainObject(branchStyle)) Object.assign(merged, branchStyle);
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
