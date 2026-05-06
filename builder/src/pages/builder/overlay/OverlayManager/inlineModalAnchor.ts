import { OVERLAY_INLINE_MODAL_BELOW_BADGE_GAP } from "../constants.ts"

/** Координаты для `position: fixed` относительно viewport (после портала в `document.body`). */
export interface InlineSettingsViewportAnchor {
  top: number
  left: number
}

/** Позиция модалки сразу под биркой overlay (нижний край бирки совпадает с верхом bounding box узла). */
export const computeInlineModalAnchorNearBadge = (
  selectedDom: HTMLElement,
): InlineSettingsViewportAnchor => {
  const r = selectedDom.getBoundingClientRect()
  const top = r.top + OVERLAY_INLINE_MODAL_BELOW_BADGE_GAP
  const left = r.left
  return { top, left }
}
