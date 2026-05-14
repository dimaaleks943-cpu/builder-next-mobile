import {
  Checkbox,
  ClickAwayListener,
  FormControlLabel,
  Popper,
  Typography,
} from "@mui/material"
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { COLORS } from "../../../../../../theme/colors.ts"
import type { CraftSizeMenuToken } from "../../../../../../utils/craftCssSizeProp.ts"
import { CraftSettingsButtonGroup } from "../../../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsFixedLabel } from "../../../../components/craftSettingsControls/styles.ts"
import { CraftSettingsSliderWithUnit } from "../../../../components/craftSettingsControls/CraftSettingsSliderWithUnit.tsx"
import { DeleteIcon } from "../../../../../../icons/DeleteIcon.tsx";
import { ProblemIcon } from "../../../../../../icons/ProblemIcon.tsx";
import {
  autoFitCheckboxDisabled,
  buildAutoFitTrackFromBasis,
  buildInitialMinmaxTrackFromBasis,
  buildMinmaxTrack,
  gridHasAnyAutoFit,
  inferSizingTabFromTrack,
  isAutoFitRepeatTrack,
  parseAutoFitBasisTrack,
  parseMinmaxTrackPair,
  sizingControlValueFromTrack,
} from "../../utils.ts"
import {
  OverlayGridManualTrackPopperDeleteButton,
  OverlayGridManualTrackPopperFooter,
  OverlayGridManualTrackPopperLabeledSliderRow,
  OverlayGridManualTrackPopperPaper,
  OverlayGridManualTrackPopperSpacedBlock,
  OverlayGridManualTrackPopperWarningBox,
} from "./styles.ts"

const GRID_TRACK_UNITS_FULL: readonly CraftSizeMenuToken[] = [
  "fr",
  "px",
  "auto",
  "min-content",
  "max-content",
]

const GRID_TRACK_UNITS_COMPACT: readonly CraftSizeMenuToken[] = ["fr", "px"]

type VirtualAnchorEl = {
  getBoundingClientRect: () => DOMRect
  contextElement?: Element
}

interface Props {
  open: boolean
  anchorEl: HTMLElement | null
  axis: "column" | "row"
  editIndex: number
  track: string
  columnTracks: string[]
  rowTracks: string[]
  onClose: () => void
  onCommitTrack: (nextTrack: string) => void
  onDelete: () => void
}

export const OverlayGridManualTrackSettingsPopper = ({
  open,
  anchorEl,
  axis,
  editIndex,
  track,
  columnTracks,
  rowTracks,
  onClose,
  onCommitTrack,
  onDelete,
}: Props) => {
  const inferredTab = useMemo(() => inferSizingTabFromTrack(track), [track])
  const [sizingTab, setSizingTab] = useState<"default" | "minmax">(inferredTab)
  const [autoFitChecked, setAutoFitChecked] = useState(() => isAutoFitRepeatTrack(track))

  useEffect(() => {
    if (!open) {
      return
    }
    setSizingTab(inferSizingTabFromTrack(track))
    setAutoFitChecked(isAutoFitRepeatTrack(track))
  }, [open, track])

  const hasAnyAutoFit = useMemo(
    () => gridHasAnyAutoFit(columnTracks, rowTracks),
    [columnTracks, rowTracks],
  )

  const allowedUnits = useMemo(
    () => (hasAnyAutoFit ? GRID_TRACK_UNITS_COMPACT : GRID_TRACK_UNITS_FULL),
    [hasAnyAutoFit],
  )

  const controlValue = useMemo(() => sizingControlValueFromTrack(track), [track])

  const minmaxPair = useMemo(() => parseMinmaxTrackPair(controlValue), [controlValue])
  const minTrackValue = minmaxPair?.min ?? "0px"
  const maxTrackValue = minmaxPair?.max ?? "1fr"

  const autoFitGate = useMemo(
    () => autoFitCheckboxDisabled(axis, editIndex, columnTracks, rowTracks),
    [axis, editIndex, columnTracks, rowTracks],
  )

  const applySizingCommit = useCallback(
    (next: string | number | undefined) => {
      if (next === undefined) {
        return
      }
      const s = typeof next === "number" ? `${next}px` : String(next).trim()
      if (!s) {
        return
      }
      if (autoFitChecked) {
        onCommitTrack(buildAutoFitTrackFromBasis(s))
        return
      }
      onCommitTrack(s)
    },
    [autoFitChecked, onCommitTrack],
  )

  const applyMinmaxPartCommit = useCallback(
    (which: "min" | "max", next: string | number | undefined) => {
      if (next === undefined) {
        return
      }
      const s = typeof next === "number" ? `${next}px` : String(next).trim()
      if (!s) {
        return
      }
      const basisNow = sizingControlValueFromTrack(track)
      const pair = parseMinmaxTrackPair(basisNow)
      const curMin = pair?.min ?? "0px"
      const curMax = pair?.max ?? "1fr"
      const nextMin = which === "min" ? s : curMin
      const nextMax = which === "max" ? s : curMax
      const built = buildMinmaxTrack(nextMin, nextMax)
      if (autoFitChecked) {
        onCommitTrack(buildAutoFitTrackFromBasis(built))
        return
      }
      onCommitTrack(built)
    },
    [autoFitChecked, onCommitTrack, track],
  )

  const handleSizingTabChange = useCallback(
    (id: string) => {
      const tab = id as "default" | "minmax"
      if (tab === "minmax") {
        setSizingTab("minmax")
        const basis = sizingControlValueFromTrack(track)
        if (!parseMinmaxTrackPair(basis)) {
          const built = buildInitialMinmaxTrackFromBasis(basis)
          if (isAutoFitRepeatTrack(track)) {
            onCommitTrack(buildAutoFitTrackFromBasis(built))
          } else {
            onCommitTrack(built)
          }
        }
        return
      }
      setSizingTab("default")
    },
    [onCommitTrack, track],
  )

  const handleAutoFitChange = useCallback(
    (_: unknown, checked: boolean) => {
      if (checked) {
        if (autoFitGate.disabled) {
          return
        }
        const basisExisting = parseAutoFitBasisTrack(track)
        const basis =
          basisExisting ??
          (typeof controlValue === "string" && controlValue.trim() !== ""
            ? controlValue.trim()
            : "200px")
        onCommitTrack(buildAutoFitTrackFromBasis(basis))
        setAutoFitChecked(true)
        return
      }
      const basis = parseAutoFitBasisTrack(track)
      onCommitTrack(basis && basis.trim() !== "" ? basis : "1fr")
      setAutoFitChecked(false)
    },
    [autoFitGate.disabled, controlValue, onCommitTrack, track],
  )

  const handleDeleteClick = useCallback(() => {
    onDelete()
    onClose()
  }, [onClose, onDelete])

  const [frozenAnchorRect, setFrozenAnchorRect] = useState<DOMRect | null>(null)

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      setFrozenAnchorRect(null)
      return
    }
    setFrozenAnchorRect(anchorEl.getBoundingClientRect())
  }, [open, anchorEl, editIndex, axis])

  const virtualAnchorEl = useMemo<VirtualAnchorEl>(
    () => ({
      getBoundingClientRect: () =>
        frozenAnchorRect ??
        new DOMRect(0, 0, 0, 0),
      contextElement: typeof document !== "undefined" ? document.documentElement : undefined,
    }),
    [frozenAnchorRect],
  )

  if (!open || !anchorEl || !frozenAnchorRect) {
    return null
  }

  return (
    <ClickAwayListener onClickAway={onClose}>
      <div>
        <Popper
          open={open}
          anchorEl={virtualAnchorEl}
          placement="bottom-start"
          style={{ zIndex: 4000 }}
          popperOptions={{ strategy: "fixed" }}
          modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
        >
          <OverlayGridManualTrackPopperPaper elevation={0}>
            <OverlayGridManualTrackPopperSpacedBlock>
              <CraftSettingsButtonGroup
                label="Sizing"
                value={sizingTab}
                options={[
                  {
                    id: "default",
                    content: "Default",
                  },
                  {
                    id: "minmax",
                    content: "Min/Max",
                  },
                ]}
                onChange={handleSizingTabChange}
              />
              {sizingTab === "default" ? (
                <>
                  {/*
                    Slider: keyword (auto/min/max-content) → px on drag; fr/px keep unit; fr uses 0.25 steps (CraftSettingsSliderWithUnit + gridTrackKeywordSlidersAtMin).
                  */}
                  <CraftSettingsSliderWithUnit
                    value={controlValue}
                    onCommit={applySizingCommit}
                    allowedUnits={allowedUnits}
                    min={0}
                    max={600}
                    step={1}
                    gridTrackKeywordSlidersAtMin
                    disableUnitPopperPortal
                  />
                </>
              ) : (
                <>
                  <OverlayGridManualTrackPopperLabeledSliderRow>
                    <CraftSettingsFixedLabel>Min</CraftSettingsFixedLabel>
                    <CraftSettingsSliderWithUnit
                      value={minTrackValue}
                      onCommit={(next) => applyMinmaxPartCommit("min", next)}
                      allowedUnits={allowedUnits}
                      min={0}
                      max={600}
                      step={1}
                      gridTrackKeywordSlidersAtMin
                      disableUnitPopperPortal
                    />
                  </OverlayGridManualTrackPopperLabeledSliderRow>
                  <OverlayGridManualTrackPopperLabeledSliderRow>
                    <CraftSettingsFixedLabel>Max</CraftSettingsFixedLabel>
                    <CraftSettingsSliderWithUnit
                      value={maxTrackValue}
                      onCommit={(next) => applyMinmaxPartCommit("max", next)}
                      allowedUnits={allowedUnits}
                      min={0}
                      max={600}
                      step={1}
                      gridTrackKeywordSlidersAtMin
                      disableUnitPopperPortal
                    />
                  </OverlayGridManualTrackPopperLabeledSliderRow>
                </>
              )}
              <FormControlLabel
                sx={{ margin: 0, alignItems: "center", marginBottom: "6px" }}
                control={
                  <Checkbox
                    size="small"
                    disableRipple
                    checked={autoFitChecked}
                    disabled={autoFitGate.disabled && !autoFitChecked}
                    onChange={handleAutoFitChange}
                    sx={{ padding: 0 }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontSize: "11px",
                      lineHeight: "16px",
                      color: COLORS.gray200,
                      fontFamily: "Inter, Arial, sans-serif",
                    }}
                  >
                    Auto-fit
                  </Typography>
                }
              />
              {autoFitGate.disabled && !autoFitChecked ? (
                <OverlayGridManualTrackPopperWarningBox>
                  <ProblemIcon />
                  <Typography
                    sx={{
                      fontSize: "10px",
                      lineHeight: "14px",
                      color: COLORS.yellow400,
                      fontFamily: "Inter, Arial, sans-serif",
                    }}
                  >
                    {autoFitGate.reason}
                  </Typography>
                </OverlayGridManualTrackPopperWarningBox>
              ) : null}
            </OverlayGridManualTrackPopperSpacedBlock>
            <OverlayGridManualTrackPopperFooter>
              <OverlayGridManualTrackPopperDeleteButton
                type="button"
                variant="outlined"
                onClick={handleDeleteClick}
                startIcon={<DeleteIcon size={16} fill={COLORS.white} />}
              >
                {axis === "column" ? "Delete column" : "Delete row"}
              </OverlayGridManualTrackPopperDeleteButton>
            </OverlayGridManualTrackPopperFooter>
          </OverlayGridManualTrackPopperPaper>
        </Popper>
      </div>
    </ClickAwayListener>
  )
}
