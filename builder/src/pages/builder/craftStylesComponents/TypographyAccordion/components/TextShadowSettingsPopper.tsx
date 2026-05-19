import { Paper, Popper } from "@mui/material"
import debounce from "lodash/debounce"
import type { Ref } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { COLORS } from "../../../../../theme/colors.ts"
import { CraftSettingsColorField } from "../../../components/craftSettingsControls/CraftSettingsColorField/CraftSettingsColorField.tsx"
import { ShadowLengthSliderRowWithReset } from "../../../components/craftSettingsControls/ShadowLengthSliderRowWithReset.tsx"
import {
  DEFAULT_TEXT_SHADOW,
  type TextShadowParts,
  textShadowFieldDiffersFromDefault,
} from "../utils/textShadowUtils.ts"

const TEXT_SHADOW_SLIDER_ROWS = [
  { label: "X", key: "offsetX" as const, min: -100, max: 100 },
  { label: "Y", key: "offsetY" as const, min: -100, max: 100 },
  { label: "Blur", key: "blur" as const, min: 0, max: 100 },
] as const

const COLOR_COMMIT_DEBOUNCE_MS = 120

interface Props {
  open: boolean
  anchorEl: HTMLElement | null
  popperRef: Ref<HTMLDivElement>
  textShadowParts: TextShadowParts
  onApplyPatch: (patch: Partial<TextShadowParts>) => void
}

export const TextShadowSettingsPopper = ({
  open,
  anchorEl,
  popperRef,
  textShadowParts,
  onApplyPatch,
}: Props) => {
  const [colorDraft, setColorDraft] = useState(textShadowParts.color)
  const onApplyPatchRef = useRef(onApplyPatch)
  onApplyPatchRef.current = onApplyPatch

  const debouncedCommitColor = useMemo(
    () =>
      debounce((color: string) => {
        onApplyPatchRef.current({ color })
      }, COLOR_COMMIT_DEBOUNCE_MS),
    [],
  )

  useEffect(() => () => debouncedCommitColor.cancel(), [debouncedCommitColor])

  useEffect(() => {
    if (!open) {
      debouncedCommitColor.flush()
    }
  }, [open, debouncedCommitColor])

  useEffect(() => {
    setColorDraft(textShadowParts.color)
  }, [textShadowParts.color])

  const handleColorChange = (value: string) => {
    setColorDraft(value)
    debouncedCommitColor(value)
  }

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
      style={{ zIndex: 4000 }}
    >
      <Paper
        ref={popperRef}
        elevation={3}
        sx={{
          width: "288px",
          maxWidth: "min(288px, calc(100vw - 24px))",
          border: `1px solid ${COLORS.purple100}`,
          borderRadius: "8px",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {TEXT_SHADOW_SLIDER_ROWS.map((row) => (
          <ShadowLengthSliderRowWithReset
            key={row.key}
            label={row.label}
            value={textShadowParts[row.key]}
            min={row.min}
            max={row.max}
            hasResetValue={textShadowFieldDiffersFromDefault(
              row.key,
              textShadowParts,
            )}
            onReset={() =>
              onApplyPatch({
                [row.key]: DEFAULT_TEXT_SHADOW[row.key],
              })
            }
            onCommitLength={(next) => onApplyPatch({ [row.key]: next })}
          />
        ))}

        <CraftSettingsColorField
          label="Color"
          value={colorDraft}
          onChange={handleColorChange}
          disableResetPopperPortal
          labelReset={{
            hasValue: textShadowFieldDiffersFromDefault("color", textShadowParts),
            onReset: () => onApplyPatch({ color: DEFAULT_TEXT_SHADOW.color }),
          }}
        />
      </Paper>
    </Popper>
  )
}
