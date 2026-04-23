import { PreviewViewport } from "./builder.enum"
import {
  FULL_TO_SHORT,
  type FullStylePropKey,
  type ShortStylePropKey,
} from "../../utils/stylePropsShortMapV1"


export type ResponsiveStyleValue = Record<string, unknown>

export type ResponsiveStyle = Partial<
  Record<PreviewViewport, ResponsiveStyleValue>
>
//TODO really need?
export const getResponsiveStyleBranch = (
  viewport: PreviewViewport,
): PreviewViewport => {
  switch (viewport) {
    case PreviewViewport.PHONE:
      return PreviewViewport.PHONE
    case PreviewViewport.PHONE_LANDSCAPE:
      return PreviewViewport.PHONE_LANDSCAPE
    case PreviewViewport.TABLET:
      return PreviewViewport.TABLET
    case PreviewViewport.TABLET_LANDSCAPE:
      return PreviewViewport.TABLET_LANDSCAPE
    case PreviewViewport.DESKTOP:
    default:
      return PreviewViewport.DESKTOP
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
  const desktop = style?.desktop ?? {}
  if (viewport === PreviewViewport.DESKTOP) {
    return { ...desktop }
  }

  const tabletLandscape = style?.tablet_landscape ?? {}
  if (viewport === PreviewViewport.TABLET_LANDSCAPE) {
    return { ...desktop, ...tabletLandscape }
  }

  const tablet = style?.tablet ?? {}
  if (viewport === PreviewViewport.TABLET) {
    return { ...desktop, ...tabletLandscape, ...tablet }
  }
  const phoneLandscape = style?.phone_landscape ?? {}
  if (viewport === PreviewViewport.PHONE_LANDSCAPE) {
    return { ...desktop, ...tabletLandscape, ...tablet, ...phoneLandscape }
  }

  const phone = style?.phone ?? {}

  return { ...desktop,  ...tabletLandscape, ...tablet, ...phoneLandscape, ...phone }
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
