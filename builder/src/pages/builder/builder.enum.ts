export enum MODE_TYPE  {
  WEB = "web",
  RN = "rn"
}

export enum PreviewViewport {
  DESKTOP = "desktop",
  TABLET_LANDSCAPE = "tablet_landscape",
  TABLET = "tablet",
  PHONE_LANDSCAPE = "phone_landscape",
  PHONE = "phone",
}

export const PREVIEW_WIDTH_DESKTOP = 1440
export const PREVIEW_WIDTH_TABLET_LANDSCAPE = 1279
export const PREVIEW_WIDTH_TABLET = 1023
export const PREVIEW_WIDTH_PHONE_LANDSCAPE = 767
export const PREVIEW_WIDTH_PHONE = 567

export const getPreviewMaxWidth = (viewport: PreviewViewport): number => {
  switch (viewport) {
    case PreviewViewport.DESKTOP:
      return PREVIEW_WIDTH_DESKTOP
    case PreviewViewport.TABLET_LANDSCAPE:
      return PREVIEW_WIDTH_TABLET_LANDSCAPE
    case PreviewViewport.TABLET:
      return PREVIEW_WIDTH_TABLET
    case PreviewViewport.PHONE_LANDSCAPE:
      return PREVIEW_WIDTH_PHONE_LANDSCAPE
    case PreviewViewport.PHONE:
      return PREVIEW_WIDTH_PHONE
    default:
      return PREVIEW_WIDTH_DESKTOP
  }
}
