import { OVERLAY_BADGE_OFFSET_Y } from "../constants.ts"

/** Координаты для `position: fixed` относительно viewport (после портала в `document.body`). */
export interface InlineSettingsViewportAnchor {
  top: number
  left: number
}

/** Позиция модалки сразу под биркой overlay (бирка над верхом bounding box узла). */
export const computeInlineModalAnchorNearBadge = (
  selectedDom: HTMLElement,
): InlineSettingsViewportAnchor => {
  const r = selectedDom.getBoundingClientRect()
  const approximateBadgeRowHeight = 22
  const top =
    r.top - OVERLAY_BADGE_OFFSET_Y + approximateBadgeRowHeight + 6
  const left = r.left
  return { top, left }
}
