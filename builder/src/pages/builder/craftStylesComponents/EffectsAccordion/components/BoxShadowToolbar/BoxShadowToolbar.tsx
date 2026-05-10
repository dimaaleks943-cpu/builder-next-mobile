import type { RefObject } from "react"
import type { BoxShadowParts } from "../../boxShadowUtils.ts"
import { ShadowEffectToolbar } from "../../../shared/ShadowEffectToolbar.tsx"

interface Props {
  hasBoxShadowConfig: boolean
  boxShadowParts: BoxShadowParts
  boxShadowSummaryLabel: string
  boxShadowOnCanvas: boolean
  popperOpen: boolean
  wrapRef: RefObject<HTMLDivElement | null>
  onTogglePopper: () => void
  onToggleCanvasVisibility: () => void
  onClear: () => void
}

export const BoxShadowToolbar = ({
  hasBoxShadowConfig,
  boxShadowParts,
  boxShadowSummaryLabel,
  boxShadowOnCanvas,
  popperOpen,
  wrapRef,
  onTogglePopper,
  onToggleCanvasVisibility,
  onClear,
}: Props) => (
  <ShadowEffectToolbar
    rowLabel="Box shadows"
    hasShadowConfig={hasBoxShadowConfig}
    swatchColor={boxShadowParts.color}
    summaryLabel={boxShadowSummaryLabel}
    shadowOnCanvas={boxShadowOnCanvas}
    popperOpen={popperOpen}
    wrapRef={wrapRef}
    rowActionsClassName="box-shadow-row-actions"
    onTogglePopper={onTogglePopper}
    onToggleCanvasVisibility={onToggleCanvasVisibility}
    onClear={onClear}
    addAriaLabel="Add box shadow"
    hideOnCanvasAriaLabel="Hide box shadow"
    showOnCanvasAriaLabel="Show box shadow"
    removeAriaLabel="Remove box shadow"
  />
)
