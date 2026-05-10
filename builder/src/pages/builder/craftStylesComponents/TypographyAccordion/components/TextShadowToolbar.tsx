import type { RefObject } from "react"
import { ShadowEffectToolbar } from "../../../components/craftSettingsControls/ShadowEffectToolbar.tsx"
import type { TextShadowParts } from "../utils/textShadowUtils.ts"

interface Props {
  hasTextShadowConfig: boolean
  textShadowParts: TextShadowParts
  textShadowSummaryLabel: string
  textShadowOnCanvas: boolean
  popperOpen: boolean
  wrapRef: RefObject<HTMLDivElement | null>
  onTogglePopper: () => void
  onToggleCanvasVisibility: () => void
  onClear: () => void
}

export const TextShadowToolbar = ({
  hasTextShadowConfig,
  textShadowParts,
  textShadowSummaryLabel,
  textShadowOnCanvas,
  popperOpen,
  wrapRef,
  onTogglePopper,
  onToggleCanvasVisibility,
  onClear,
}: Props) => (
  <ShadowEffectToolbar
    rowLabel="Text shadow"
    hasShadowConfig={hasTextShadowConfig}
    swatchColor={textShadowParts.color}
    summaryLabel={textShadowSummaryLabel}
    shadowOnCanvas={textShadowOnCanvas}
    popperOpen={popperOpen}
    wrapRef={wrapRef}
    rowActionsClassName="text-shadow-row-actions"
    onTogglePopper={onTogglePopper}
    onToggleCanvasVisibility={onToggleCanvasVisibility}
    onClear={onClear}
    addAriaLabel="Add text shadow"
    hideOnCanvasAriaLabel="Hide text shadow"
    showOnCanvasAriaLabel="Show text shadow"
    removeAriaLabel="Remove text shadow"
  />
)
