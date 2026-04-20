import type { PreviewViewport } from "./builder.enum"
import {
  FULL_TO_SHORT,
  type FullStylePropKey,
  type ShortStylePropKey,
} from "../../utils/stylePropsShortMapV1"

export type ResponsiveStyleBranch = "base" | "tablet" | "phone"

export type ResponsiveStyleValue = Record<string, unknown>

export type ResponsiveStyle = Partial<
  Record<ResponsiveStyleBranch, ResponsiveStyleValue>
>

export const getResponsiveStyleBranch = (
  viewport: PreviewViewport,
): ResponsiveStyleBranch => {
  switch (viewport) {
    case "tablet":
      return "tablet"
    case "phone":
      return "phone"
    case "desktop":
    default:
      return "base"
  }
}

export const setResponsiveStyleProp = (
  props: Record<string, unknown>,
  key: string,
  value: unknown,
  viewport: PreviewViewport,
) => {
  const branch = getResponsiveStyleBranch(viewport)
  const currentStyle = (props.style as ResponsiveStyle | undefined) ?? {}
  const currentBranch = { ...(currentStyle[branch] ?? {}) }

  if (value === undefined) {
    delete currentBranch[key]
  } else {
    currentBranch[key] = value
  }

  props.style = {
    ...currentStyle,
    [branch]: currentBranch,
  }

  // Keep a single source of truth in props.style.* and remove flat duplicates.
  delete props[key]
  const shortKey = FULL_TO_SHORT[key as FullStylePropKey] as
    | ShortStylePropKey
    | undefined
  if (shortKey) {
    delete props[shortKey]
  }
}

export const resolveResponsiveStyle = (
  style: ResponsiveStyle | undefined,
  viewport: PreviewViewport,
): Record<string, unknown> => {
  const base = style?.base ?? {}
  if (viewport === "desktop") {
    return { ...base }
  }

  const tablet = style?.tablet ?? {}
  if (viewport === "tablet") {
    return { ...base, ...tablet }
  }

  const phone = style?.phone ?? {}
  return { ...base, ...tablet, ...phone }
}

export const getResponsiveStyleProp = (
  props: Record<string, unknown> | null | undefined,
  key: string,
  viewport: PreviewViewport,
) => {
  const resolved = resolveResponsiveStyle(
    (props?.style as ResponsiveStyle | undefined) ?? undefined,
    viewport,
  )
  return resolved[key]
}
