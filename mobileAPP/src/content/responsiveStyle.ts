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
 * Serialized `props.style` branch names (same order as builder / SSR `BRANCHES`).
 * `desktop` is always merged first; narrower breakpoints override.
 */
export const RESPONSIVE_STYLE_BRANCHES = [
  "desktop",
  "tablet_landscape",
  "tablet",
  "phone_landscape",
  "phone",
] as const;

/**
 * Viewport branches used when mapping window size to a branch (no separate `desktop` viewport on device).
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
 * Maps window dimensions to one of four responsive branches.
 * Uses the shorter side to separate phone vs tablet form factor and orientation for *_landscape.
 * Styles from the `desktop` branch are always merged in {@link resolveResponsiveStyle} first.
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

/**
 * Merges `desktop`, then each branch in {@link VIEWPORT_CASCADE} up to and including `viewport`
 * (same cascade as builder `resolveResponsiveStyle` for non-desktop viewports).
 */
export const resolveResponsiveStyle = (
  style: unknown,
  viewport: Viewport,
): Record<string, unknown> => {
  if (!isPlainObject(style)) return {};

  const merged: Record<string, unknown> = {};
  const desktop = style.desktop;
  if (isPlainObject(desktop)) Object.assign(merged, desktop);

  const depth = viewportCascadeDepth[viewport];
  for (let i = 0; i <= depth; i++) {
    const branch = VIEWPORT_CASCADE[i];
    const branchStyle = style[branch];
    if (isPlainObject(branchStyle)) Object.assign(merged, branchStyle);
  }

  return merged;
};

/** Read a finite number from a merged responsive-style record (Craft JSON → RN). */
export const pickResolvedNumber = (
  rs: Record<string, unknown>,
  key: string,
  fallback: number,
): number => {
  const v = rs[key];
  if (v === undefined || v === null) return fallback;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
