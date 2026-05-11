import { Box } from "@mui/material"
import type { ChangeEvent, KeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { CraftSettingsButtonGroup } from "../../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsValueWithUnit } from "../../../components/craftSettingsControls/CraftSettingsValueWithUnit.tsx"
import { BackgroundPositionNineGrid } from "../../BackgroundPositionNineGrid/BackgroundPositionNineGrid.tsx"
import { GradientStopsTrackSection } from "../../GradientStopsTrackSection/GradientStopsTrackSection.tsx"
import { BACKGROUND_POSITION_UNIT_MENU } from "../../../../../utils/craftCssSizeProp.ts"
import {
  buildHorizontalLinearGradientTrackPreviewCss,
  clampPercent,
  newGradientStopId,
  normalizeStopsForUi,
  sampleLinearGradientColorAtPercent,
  sortStopsByPosition,
  type LinearGradientUiStop,
} from "../utils/linearGradientEditorUtils.ts"
import {
  buildRadialGradientCss,
  buildRadialShapeHeadFromUi,
  DEFAULT_TWO_STOP_RADIAL,
  parseRadialEndingSizeFromShapeHead,
  parseRadialGradientValue,
  radialShapeHeadToPositionPair,
  type RadialEndingSizeUi,
} from "../utils/radialGradientEditorUtils.ts"
import {
  ImageGradientMenuFullBleedDivider,
  ImageGradientMenuSectionDense,
  InsetAxisLabel,
  InsetAxisRow,
  MenuRow,
  MenuRowLabel,
  PositionBlock,
  PositionInputsColumn,
} from "./ImageGradientMenuPopper.styles.ts"

interface Props {
  backgroundImage: string | undefined
  onCommitBackgroundImage: (
    next: string | undefined,
    options?: { urlFillDefaults?: "apply" | "clear" },
  ) => void
}

const MIN_STOP_POSITION_SEPARATION_PCT = 1

const distinctStopPosition = (desired: number, otherPositions: number[]): number => {
  const d = clampPercent(desired)
  const others = otherPositions
  const ok = (x: number) =>
    !others.some((o) => Math.abs(x - o) < MIN_STOP_POSITION_SEPARATION_PCT)
  if (ok(d)) return d
  const step = 0.1
  for (let k = 1; k <= 1000; k++) {
    const up = clampPercent(d + step * k)
    const down = clampPercent(d - step * k)
    const candidates = [up, down].filter(ok)
    if (candidates.length === 0) continue
    let best = candidates[0]!
    for (let i = 1; i < candidates.length; i++) {
      const q = candidates[i]!
      if (Math.abs(q - d) < Math.abs(best - d)) best = q
    }
    return best
  }
  return d
}

const applyDistinctStopPositionByStopId = (
  stopsInStableOrder: LinearGradientUiStop[],
  stopId: string,
  nextPos: number,
): LinearGradientUiStop[] => {
  const idx = stopsInStableOrder.findIndex((s) => s.id === stopId)
  if (idx < 0) return stopsInStableOrder
  const out = [...stopsInStableOrder]
  const others = out.filter((_, i) => i !== idx).map((s) => s.position)
  const p = distinctStopPosition(nextPos, others)
  out[idx] = { ...out[idx]!, position: p }
  return out
}

export const RadialGradientEditorSection = ({
  backgroundImage,
  onCommitBackgroundImage,
}: Props) => {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const skipSyncRef = useRef(false)
  const isDraggingThumbRef = useRef(false)

  const [repeating, setRepeating] = useState(false)
  const [shapeHead, setShapeHead] = useState<string | null>("circle")
  const [stops, setStops] = useState<LinearGradientUiStop[]>(() =>
    sortStopsByPosition(normalizeStopsForUi(DEFAULT_TWO_STOP_RADIAL.stops)),
  )
  const [selectedStopIndex, setSelectedStopIndex] = useState(0)
  const [percentDraft, setPercentDraft] = useState("0")

  const pair = radialShapeHeadToPositionPair(shapeHead)
  const positionPairForGrid = `${pair.x} ${pair.y}`
  const endingSize = parseRadialEndingSizeFromShapeHead(shapeHead)

  const gradientTrackPreviewCss = buildHorizontalLinearGradientTrackPreviewCss({
    repeating,
    stops,
    angleCss: "90deg",
  })

  useEffect(() => {
    if (isDraggingThumbRef.current) return
    if (skipSyncRef.current) {
      skipSyncRef.current = false
      return
    }
    const parsed = parseRadialGradientValue(backgroundImage) ?? DEFAULT_TWO_STOP_RADIAL
    setRepeating(parsed.repeating)
    setShapeHead(parsed.shapeHead ?? "circle")
    setStops(sortStopsByPosition(normalizeStopsForUi(parsed.stops)))
    setSelectedStopIndex(0)
  }, [backgroundImage])

  const safeSelectedIndex =
    selectedStopIndex >= 0 && selectedStopIndex < stops.length ? selectedStopIndex : 0
  const selectedStop = stops[safeSelectedIndex] ?? stops[0]!

  useEffect(() => {
    setPercentDraft(String(Math.round(selectedStop.position)))
  }, [selectedStop.position, safeSelectedIndex])

  const commitRadialRaw = useCallback(
    (rep: boolean, nextShapeHead: string | null, nextStops: LinearGradientUiStop[]) => {
      skipSyncRef.current = true
      const sorted = sortStopsByPosition(nextStops)
      setRepeating(rep)
      setShapeHead(nextShapeHead)
      setStops(sorted)
      onCommitBackgroundImage(
        buildRadialGradientCss({
          repeating: rep,
          shapeHead: nextShapeHead,
          stops: sorted,
        }),
        { urlFillDefaults: "clear" },
      )
    },
    [onCommitBackgroundImage],
  )

  const commitRadial = useCallback(
    (next: { repeating: boolean; shapeHead: string | null; stops: LinearGradientUiStop[] }) => {
      commitRadialRaw(next.repeating, next.shapeHead, next.stops)
    },
    [commitRadialRaw],
  )

  const handlePositionXCommit = (next: string | number | undefined) => {
    const nextShape = buildRadialShapeHeadFromUi(
      endingSize,
      String(next ?? pair.x),
      pair.y,
    )
    commitRadial({ repeating, shapeHead: nextShape, stops })
  }

  const handlePositionYCommit = (next: string | number | undefined) => {
    const nextShape = buildRadialShapeHeadFromUi(
      endingSize,
      pair.x,
      String(next ?? pair.y),
    )
    commitRadial({ repeating, shapeHead: nextShape, stops })
  }

  const handleNineGridPairCommit = (presetPair: string) => {
    const tokens = presetPair.trim().split(/\s+/).filter(Boolean)
    const x = tokens[0] ?? "50%"
    const y = tokens[1] ?? "50%"
    const nextShape = buildRadialShapeHeadFromUi(endingSize, x, y)
    commitRadial({ repeating, shapeHead: nextShape, stops })
  }

  const handleRadialSizeChange = (id: string) => {
    const nextSize = id as RadialEndingSizeUi
    const nextShape = buildRadialShapeHeadFromUi(nextSize, pair.x, pair.y)
    commitRadial({ repeating, shapeHead: nextShape, stops })
  }

  const commitPercentDraft = () => {
    const n = parseFloat(percentDraft.replace(",", "."))
    if (Number.isNaN(n)) {
      setPercentDraft(String(Math.round(selectedStop.position)))
      return
    }
    const nextRaw = applyDistinctStopPositionByStopId(stops, selectedStop.id, n)
    const nextSorted = sortStopsByPosition(nextRaw)
    const nextSel = nextSorted.findIndex((s) => s.id === selectedStop.id)
    if (nextSel >= 0) setSelectedStopIndex(nextSel)
    commitRadial({ repeating, shapeHead, stops: nextSorted })
  }

  const handleThumbPointerDown =
    (stopId: string) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!event.isPrimary) return
      if (event.pointerType === "mouse" && event.button !== 0) return
      event.preventDefault()
      event.stopPropagation()

      const btn = event.currentTarget
      btn.setPointerCapture(event.pointerId)
      isDraggingThumbRef.current = true

      const repSnap = repeating
      const shapeSnap = shapeHead
      let latest = [...stops]
      let finished = false

      const onMove = (ev: PointerEvent) => {
        if (!trackRef.current) return
        const rect = trackRef.current.getBoundingClientRect()
        if (rect.width <= 0) return
        const pct = clampPercent(((ev.clientX - rect.left) / rect.width) * 100)
        setStops((prev) => {
          const next = applyDistinctStopPositionByStopId(prev, stopId, pct)
          latest = next
          return next
        })
      }

      const finish = (ev: PointerEvent) => {
        if (finished) return
        finished = true
        if (btn.hasPointerCapture(ev.pointerId)) {
          btn.releasePointerCapture(ev.pointerId)
        }
        btn.removeEventListener("pointermove", onMove)
        btn.removeEventListener("pointerup", finish)
        btn.removeEventListener("pointercancel", finish)
        isDraggingThumbRef.current = false
        const sortedLatest = sortStopsByPosition(latest)
        const sel = sortedLatest.findIndex((s) => s.id === stopId)
        if (sel >= 0) setSelectedStopIndex(sel)
        skipSyncRef.current = true
        setStops(sortedLatest)
        onCommitBackgroundImage(
          buildRadialGradientCss({
            repeating: repSnap,
            shapeHead: shapeSnap,
            stops: sortedLatest,
          }),
          { urlFillDefaults: "clear" },
        )
      }

      btn.addEventListener("pointermove", onMove)
      btn.addEventListener("pointerup", finish)
      btn.addEventListener("pointercancel", finish)
    }

  const handleTrackShellMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    const target = event.target as HTMLElement
    if (target.closest("[data-gradient-thumb]")) return

    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0) return
    const pct = clampPercent(((event.clientX - rect.left) / rect.width) * 100)

    const sorted = sortStopsByPosition(stops)
    const tooClose = sorted.some(
      (s) => Math.abs(s.position - pct) < MIN_STOP_POSITION_SEPARATION_PCT,
    )
    if (tooClose) return

    const color = sampleLinearGradientColorAtPercent(sorted, pct)
    const newStop: LinearGradientUiStop = {
      id: newGradientStopId(),
      color,
      position: pct,
    }
    const nextStops = sortStopsByPosition([...sorted, newStop])
    const newIdx = nextStops.findIndex((s) => s.id === newStop.id)
    setSelectedStopIndex(newIdx >= 0 ? newIdx : 0)
    commitRadial({ repeating, shapeHead, stops: nextStops })
  }

  const handleRepeatChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    commitRadial({ repeating: checked, shapeHead, stops })
  }

  const handleSwapClick = () => {
    if (stops.length < 2) return
    const sorted = sortStopsByPosition(stops)
    const n = sorted.length
    const mirrored = sorted.map((_, i) => {
      const src = sorted[n - 1 - i]!
      return {
        ...sorted[i]!,
        color: src.color,
        position: 100 - src.position,
      }
    })
    commitRadial({
      repeating,
      shapeHead,
      stops: sortStopsByPosition(mirrored),
    })
  }

  const handleSelectedColorChange = (stopId: string, nextColor: string) => {
    const nextStops = stops.map((s) =>
      s.id === stopId ? { ...s, color: nextColor } : s,
    )
    commitRadial({ repeating, shapeHead, stops: nextStops })
  }

  const handlePercentDraftChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPercentDraft(event.target.value)
  }

  const handlePercentKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      commitPercentDraft()
    }
  }

  return (
    <ImageGradientMenuSectionDense>
      <MenuRow>
        <MenuRowLabel sx={{ alignSelf: "start" }}>Position</MenuRowLabel>
        <PositionBlock>
          <BackgroundPositionNineGrid
            positionPair={positionPairForGrid}
            onCommitPair={handleNineGridPairCommit}
          />
          <PositionInputsColumn>
            <InsetAxisRow>
              <InsetAxisLabel>Left</InsetAxisLabel>
              <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
                <CraftSettingsValueWithUnit
                  label="Left"
                  withoutLabel
                  disableUnitPopperPortal
                  unitAffixVariant="mutedLowercase"
                  allowedUnits={BACKGROUND_POSITION_UNIT_MENU}
                  value={pair.x}
                  onCommit={handlePositionXCommit}
                  mode="web"
                  placeholder="0"
                  inputWidth="100%"
                  customWidth="100%"
                />
              </Box>
            </InsetAxisRow>
            <InsetAxisRow>
              <InsetAxisLabel>Top</InsetAxisLabel>
              <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
                <CraftSettingsValueWithUnit
                  label="Top"
                  withoutLabel
                  disableUnitPopperPortal
                  unitAffixVariant="mutedLowercase"
                  allowedUnits={BACKGROUND_POSITION_UNIT_MENU}
                  value={pair.y}
                  onCommit={handlePositionYCommit}
                  mode="web"
                  placeholder="0"
                  inputWidth="100%"
                  customWidth="100%"
                />
              </Box>
            </InsetAxisRow>
          </PositionInputsColumn>
        </PositionBlock>
      </MenuRow>

      <ImageGradientMenuFullBleedDivider />

      <CraftSettingsButtonGroup
        label="Size"
        value={endingSize}
        onChange={handleRadialSizeChange}
        disableResetPopperPortal
        options={[
          { id: "closest-side", content: "CS" },
          { id: "closest-corner", content: "CC" },
          { id: "farthest-side", content: "FS" },
          { id: "circle", content: "Cr" },
        ]}
      />

      <ImageGradientMenuFullBleedDivider />

      <GradientStopsTrackSection
        trackRef={trackRef}
        gradientTrackPreviewCss={gradientTrackPreviewCss}
        stops={stops}
        selectedStop={selectedStop}
        onThumbPointerDown={handleThumbPointerDown}
        onTrackShellMouseDown={handleTrackShellMouseDown}
        onSelectStopIndex={setSelectedStopIndex}
        repeating={repeating}
        onRepeatChange={handleRepeatChange}
        onSwapClick={handleSwapClick}
        percentDraft={percentDraft}
        onPercentDraftChange={handlePercentDraftChange}
        onPercentBlur={commitPercentDraft}
        onPercentKeyDown={handlePercentKeyDown}
        onSelectedColorChange={handleSelectedColorChange}
      />
    </ImageGradientMenuSectionDense>
  )
}

