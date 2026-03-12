export enum MODE_TYPE  {
  WEB = "web",
  RN = "rn"
}

export type PreviewViewport = "desktop" | "tablet" | "phone"

export const PREVIEW_WIDTH_DESKTOP = 1440
export const PREVIEW_WIDTH_TABLET = 880
export const PREVIEW_WIDTH_PHONE = 500

export function getPreviewMaxWidth(viewport: PreviewViewport): number {
  switch (viewport) {
    case "desktop":
      return PREVIEW_WIDTH_DESKTOP
    case "tablet":
      return PREVIEW_WIDTH_TABLET
    case "phone":
      return PREVIEW_WIDTH_PHONE
    default:
      return PREVIEW_WIDTH_DESKTOP
  }
}
