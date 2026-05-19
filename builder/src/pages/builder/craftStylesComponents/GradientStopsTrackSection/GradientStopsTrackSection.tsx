import { Box } from "@mui/material"
import debounce from "lodash/debounce"
import type { ChangeEvent, KeyboardEvent, PointerEvent as ReactPointerEvent, RefObject } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { CraftSettingsColorField } from "../../components/craftSettingsControls/CraftSettingsColorField/CraftSettingsColorField.tsx"
import { CraftSettingsInput } from "../../components/craftSettingsControls/CraftSettingsInput.tsx"
import { COLORS } from "../../../../theme/colors.ts"
import { UpdateIcon } from "../../../../icons/UpdateIcon.tsx"
import type { LinearGradientUiStop } from "../BackgroundAccordion/utils/linearGradientEditorUtils.ts"
import {
  MenuRow,
  MenuRowLabel,
  PixelDensityCheckbox,
} from "../BackgroundAccordion/components/ImageGradientMenuPopper.styles.ts"
import {
  LinearGradientOptionsRow,
  LinearGradientRepeatLabel,
  LinearGradientSwapButton,
  LinearGradientThumb,
  LinearGradientTrackFill,
  LinearGradientTrackShell,
} from "../BackgroundAccordion/components/LinearGradientEditorSection.styles.ts"

const SELECTED_COLOR_COMMIT_DEBOUNCE_MS = 120

interface Props {
  trackRef: RefObject<HTMLDivElement | null>
  gradientTrackPreviewCss: string
  stops: LinearGradientUiStop[]
  selectedStop: LinearGradientUiStop
  onThumbPointerDown: (stopId: string) => (e: ReactPointerEvent<HTMLButtonElement>) => void
  onTrackShellMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void
  onSelectStopIndex: (index: number) => void
  repeating: boolean
  onRepeatChange: (_: ChangeEvent<HTMLInputElement>, checked: boolean) => void
  onSwapClick: () => void
  percentDraft: string
  onPercentDraftChange: (event: ChangeEvent<HTMLInputElement>) => void
  onPercentBlur: () => void
  onPercentKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onSelectedColorChange: (stopId: string, nextColor: string) => void
}

export const GradientStopsTrackSection = ({
  trackRef,
  gradientTrackPreviewCss,
  stops,
  selectedStop,
  onThumbPointerDown,
  onTrackShellMouseDown,
  onSelectStopIndex,
  repeating,
  onRepeatChange,
  onSwapClick,
  percentDraft,
  onPercentDraftChange,
  onPercentBlur,
  onPercentKeyDown,
  onSelectedColorChange,
}: Props) => {
  const [displayColor, setDisplayColor] = useState(() => selectedStop.color)

  const onSelectedColorChangeRef = useRef(onSelectedColorChange)
  onSelectedColorChangeRef.current = onSelectedColorChange

  const debouncedCommitColor = useMemo(
    () =>
      debounce((stopId: string, color: string) => {
        onSelectedColorChangeRef.current(stopId, color)
      }, SELECTED_COLOR_COMMIT_DEBOUNCE_MS),
    [],
  )

  useEffect(
    () => () => {
      debouncedCommitColor.flush()
      debouncedCommitColor.cancel()
    },
    [debouncedCommitColor],
  )

  useEffect(() => {
    debouncedCommitColor.flush()
    setDisplayColor(selectedStop.color)
  }, [selectedStop.id, selectedStop.color, debouncedCommitColor])

  const handleColorFieldChange = (nextColor: string) => {
    setDisplayColor(nextColor)
    debouncedCommitColor(selectedStop.id, nextColor)
  }

  return (
    <>
      <LinearGradientTrackShell ref={trackRef} onMouseDown={onTrackShellMouseDown}>
        <LinearGradientTrackFill sx={{ backgroundImage: gradientTrackPreviewCss }} />
        {stops.map((stop, i) => (
          <LinearGradientThumb
            key={stop.id}
            type="button"
            data-gradient-thumb=""
            aria-label={`Gradient stop ${i + 1}`}
            $selected={selectedStop.id === stop.id}
            $stopColor={stop.color.trim() || COLORS.black}
            style={{ left: `${stop.position}%` }}
            onPointerDown={(e) => {
              onSelectStopIndex(i)
              onThumbPointerDown(stop.id)(e)
            }}
            onClick={(e) => {
              e.stopPropagation()
              onSelectStopIndex(i)
            }}
          />
        ))}
      </LinearGradientTrackShell>

      <LinearGradientOptionsRow>
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <PixelDensityCheckbox
            size="small"
            checked={repeating}
            onChange={onRepeatChange}
            inputProps={{ "aria-label": "Repeat gradient" }}
          />
          <LinearGradientRepeatLabel component="span">Repeat</LinearGradientRepeatLabel>
        </Box>
        <LinearGradientSwapButton
          type="button"
          size="small"
          aria-label="Reverse gradient"
          onClick={onSwapClick}
        >
          <UpdateIcon size={14} fill={COLORS.gray700} />
        </LinearGradientSwapButton>
      </LinearGradientOptionsRow>

      <MenuRow sx={{ alignItems: "flex-start" }}>
        <MenuRowLabel sx={{ alignSelf: "center" }}>Color</MenuRowLabel>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <CraftSettingsColorField
            hideLabel
            label="Gradient stop color"
            value={displayColor}
            onChange={handleColorFieldChange}
            disableResetPopperPortal
          />
          <CraftSettingsInput
            hideLabel
            label="Gradient stop position"
            type="number"
            min={0}
            suffix="%"
            value={percentDraft}
            onChange={onPercentDraftChange}
            onBlur={onPercentBlur}
            onKeyDown={onPercentKeyDown}
            customStyles={{ flex: "none", width: "52px" }}
            disableResetPopperPortal
          />
        </Box>
      </MenuRow>
    </>
  )
}
