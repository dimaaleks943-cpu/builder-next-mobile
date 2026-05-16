import type { TextStyle } from "react-native";

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

export type ResponsiveStyleBranch = (typeof RESPONSIVE_STYLE_BRANCHES)[number];

export type ResponsiveStyle = Partial<
  Record<ResponsiveStyleBranch, Record<string, unknown>>
>;

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

/** Parse Craft/CSS size values (`14`, `"14"`, `"14px"`) to a finite number for RN. */
export const parseCssPx = (value: unknown): number | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const match = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*px?$/i);
    if (match) {
      const n = Number(match[1]);
      return Number.isFinite(n) ? n : undefined;
    }
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : undefined;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const SPACING_KEYS = [
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
] as const;

const pickResolvedColor = (
  rs: Record<string, unknown>,
  key: string,
): string | undefined => {
  const v = rs[key];
  if (v === undefined || v === null || v === "") return undefined;
  return String(v);
};

const pickResolvedFontWeight = (
  rs: Record<string, unknown>,
): TextStyle["fontWeight"] | undefined => {
  const v = rs.fontWeight;
  if (v === undefined || v === null || v === "") return undefined;
  if (typeof v === "number" && Number.isFinite(v)) {
    return v as TextStyle["fontWeight"];
  }
  const s = String(v).trim();
  if (s === "normal" || s === "bold") return s;
  const n = Number(s);
  if (Number.isFinite(n)) return String(n) as TextStyle["fontWeight"];
  return s as TextStyle["fontWeight"];
};

/** Craft responsive-style fields safe for RN Text (no CSS-only / Craft-only keys). */
export const buildCraftTextRnStyle = (rs: Record<string, unknown>): TextStyle => {
  const style: TextStyle = {};

  const fontSize = parseCssPx(rs.fontSize);
  if (fontSize !== undefined) style.fontSize = fontSize;

  const lineHeight = parseCssPx(rs.lineHeight);
  if (lineHeight !== undefined) style.lineHeight = lineHeight;

  const color = pickResolvedColor(rs, "color");
  if (color) style.color = color;

  const fontWeight = pickResolvedFontWeight(rs);
  if (fontWeight !== undefined) style.fontWeight = fontWeight;

  const letterSpacing = parseCssPx(rs.letterSpacing);
  if (letterSpacing !== undefined) style.letterSpacing = letterSpacing;

  const textAlign = rs.textAlign;
  if (
    textAlign === "auto" ||
    textAlign === "left" ||
    textAlign === "right" ||
    textAlign === "center" ||
    textAlign === "justify"
  ) {
    style.textAlign = textAlign;
  }

  for (const key of SPACING_KEYS) {
    const n = parseCssPx(rs[key]);
    if (n !== undefined) style[key] = n;
  }

  const padding = parseCssPx(rs.padding);
  if (padding !== undefined) style.padding = padding;

  const margin = parseCssPx(rs.margin);
  if (margin !== undefined) style.margin = margin;

  return style;
};

/** Read a finite number from a merged responsive-style record (Craft JSON → RN). */
export const pickResolvedNumber = (
  rs: Record<string, unknown>,
  key: string,
  fallback: number,
): number => {
  const parsed = parseCssPx(rs[key]);
  return parsed !== undefined ? parsed : fallback;
};
