import { Box } from "@mui/material"
import type {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { CraftSettingsValueWithUnit } from "../../../components/craftSettingsControls/CraftSettingsValueWithUnit.tsx"
import { COLORS } from "../../../../../theme/colors.ts"
import { UpdateIcon } from "../../../../../icons/UpdateIcon.tsx"
import {
  CRAFT_GRADIENT_ANGLE_UNIT_MENU,
  buildCommittedAnglePrefix,
  degreesToUnitValue,
  formatGradientAngleCss,
  gradientAngleUnitStep,
  parseGradientAnglePrefix,
  pointerVectorToAngleDeg,
  unitValueToDegrees,
  wrapUnitValue,
  type AngleCommitState,
  type GradientAngleUnit,
} from "../utils/linearGradientAngleUtils.ts"
import {
  DEFAULT_TWO_STOP_LINEAR,
  buildHorizontalLinearGradientTrackPreviewCss,
  buildLinearGradientCss,
  clampPercent,
  newGradientStopId,
  normalizeStopsForUi,
  parseLinearGradientValue,
  sampleLinearGradientColorAtPercent,
  sortStopsByPosition,
  type LinearGradientUiStop,
} from "../utils/linearGradientEditorUtils.ts"
import { GradientStopsTrackSection } from "../../GradientStopsTrackSection/GradientStopsTrackSection.tsx"
import {
  ImageGradientMenuFullBleedDivider,
  ImageGradientMenuSectionDense,
  MenuRow,
  MenuRowLabel,
} from "./ImageGradientMenuPopper.styles.ts"
import {
  LinearGradientAngleDialKnob,
  LinearGradientAngleDialRotate,
  LinearGradientAngleDialShell,
  LinearGradientAngleStepButton,
} from "./LinearGradientEditorSection.styles.ts"

interface Props {
  backgroundImage: string | undefined
  onCommitBackgroundImage: (
    next: string | undefined,
    options?: { urlFillDefaults?: "apply" | "clear" },
  ) => void
}

/** Два стопа не могут совпадать по %; минимальное расстояние между позициями (как в UI целых процентов). */
const MIN_STOP_POSITION_SEPARATION_PCT = 1

/** Ближайшая к desired позиция, отстоящая от каждого из others минимум на MIN_STOP_POSITION_SEPARATION_PCT. */
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

/** Обновляет позицию стопа без перестановки элементов массива — нужно во время drag, иначе React меняет порядок DOM и теряется pointer capture. */
const applyDistinctStopPositionAtStableIndex = (
  stopsInStableOrder: LinearGradientUiStop[],
  index: number,
  nextPos: number,
): LinearGradientUiStop[] => {
  const out = [...stopsInStableOrder]
  const others = out.filter((_, i) => i !== index).map((s) => s.position)
  const p = distinctStopPosition(nextPos, others)
  out[index] = { ...out[index]!, position: p }
  return out
}

const applyDistinctStopPositionByStopId = (
  stopsInStableOrder: LinearGradientUiStop[],
  stopId: string,
  nextPos: number,
): LinearGradientUiStop[] => {
  const idx = stopsInStableOrder.findIndex((s) => s.id === stopId)
  if (idx < 0) return stopsInStableOrder
  return applyDistinctStopPositionAtStableIndex(stopsInStableOrder, idx, nextPos)
}

export const LinearGradientEditorSection = ({
  backgroundImage,
  onCommitBackgroundImage,
}: Props) => {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const skipSyncRef = useRef(false)
  const isDraggingThumbRef = useRef(false)

  const [repeating, setRepeating] = useState(false)
  const [anglePassthrough, setAnglePassthrough] = useState<string | null>(null)
  const [angleExplicit, setAngleExplicit] = useState(false)
  const [originalSideKeyword, setOriginalSideKeyword] = useState<string | null>(null)
  const [angleDeg, setAngleDeg] = useState(0)
  const [angleUnit, setAngleUnit] = useState<GradientAngleUnit>("deg")
  const [stops, setStops] = useState<LinearGradientUiStop[]>(() =>
    sortStopsByPosition(normalizeStopsForUi(DEFAULT_TWO_STOP_LINEAR.stops)),
  )
  const [selectedStopIndex, setSelectedStopIndex] = useState(0)
  const [percentDraft, setPercentDraft] = useState("0")

  const gradientTrackPreviewCss = buildHorizontalLinearGradientTrackPreviewCss({
    repeating,
    stops,
    angleCss: "90deg",
  })

  const angleValueWithUnitProp = useMemo(() => {
    const v = degreesToUnitValue(angleDeg, angleUnit)
    const w = wrapUnitValue(v, angleUnit)
    return formatGradientAngleCss(w, angleUnit)
  }, [angleDeg, angleUnit])

  useEffect(() => {
    if (isDraggingThumbRef.current) return
    if (skipSyncRef.current) {
      skipSyncRef.current = false
      return
    }
    const parsed = parseLinearGradientValue(backgroundImage) ?? DEFAULT_TWO_STOP_LINEAR
    setRepeating(parsed.repeating)
    const apParsed = parseGradientAnglePrefix(parsed.anglePrefix)
    if (apParsed.kind === "passthrough") {
      setAnglePassthrough(apParsed.raw)
      setAngleDeg(0)
      setAngleUnit("deg")
      setAngleExplicit(true)
      setOriginalSideKeyword(null)
    } else if (apParsed.kind === "none") {
      setAnglePassthrough(null)
      setAngleDeg(0)
      setAngleUnit("deg")
      setAngleExplicit(false)
      setOriginalSideKeyword(null)
    } else if (apParsed.kind === "side") {
      setAnglePassthrough(null)
      setAngleDeg(apParsed.angleDeg)
      setAngleUnit("deg")
      setAngleExplicit(false)
      setOriginalSideKeyword(apParsed.raw)
    } else {
      setAnglePassthrough(null)
      setAngleDeg(apParsed.angleDeg)
      setAngleUnit(apParsed.unit)
      setAngleExplicit(true)
      setOriginalSideKeyword(null)
    }
    setStops(sortStopsByPosition(normalizeStopsForUi(parsed.stops)))
    setSelectedStopIndex(0)
  }, [backgroundImage])

  const safeSelectedIndex =
    selectedStopIndex >= 0 && selectedStopIndex < stops.length ? selectedStopIndex : 0
  const selectedStop = stops[safeSelectedIndex] ?? stops[0]!

  useEffect(() => {
    setPercentDraft(String(Math.round(selectedStop.position)))
  }, [selectedStop.position, safeSelectedIndex])

  const commitGradientRaw = useCallback(
    (rep: boolean, nextStops: LinearGradientUiStop[], slice: AngleCommitState) => {
      skipSyncRef.current = true
      const sorted = sortStopsByPosition(nextStops)
      setRepeating(rep)
      setStops(sorted)
      setAnglePassthrough(slice.anglePassthrough)
      setAngleExplicit(slice.angleExplicit)
      setOriginalSideKeyword(slice.originalSideKeyword)
      setAngleDeg(slice.angleDeg)
      setAngleUnit(slice.angleUnit)
      const ap = buildCommittedAnglePrefix(slice)
      onCommitBackgroundImage(
        buildLinearGradientCss({
          repeating: rep,
          anglePrefix: ap,
          stops: sorted,
        }),
        { urlFillDefaults: "clear" },
      )
    },
    [onCommitBackgroundImage],
  )

  const commitGradient = useCallback(
    (next: { repeating: boolean; stops: LinearGradientUiStop[] }) => {
      commitGradientRaw(next.repeating, next.stops, {
        anglePassthrough,
        angleExplicit,
        originalSideKeyword,
        angleDeg,
        angleUnit,
      })
    },
    [
      commitGradientRaw,
      anglePassthrough,
      angleExplicit,
      originalSideKeyword,
      angleDeg,
      angleUnit,
    ],
  )

  const handleAngleValueWithUnitCommit = useCallback(
    (next: string | number | undefined) => {
      if (anglePassthrough) return
      if (typeof next !== "string" || !next.trim()) return
      const parsed = parseGradientAnglePrefix(next)
      if (parsed.kind !== "numeric") return
      commitGradientRaw(repeating, stops, {
        anglePassthrough: null,
        angleExplicit: true,
        originalSideKeyword: null,
        angleDeg: parsed.angleDeg,
        angleUnit: parsed.unit,
      })
    },
    [anglePassthrough, commitGradientRaw, repeating, stops],
  )

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
    commitGradient({ repeating, stops: nextSorted })
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
      const angSnap = buildCommittedAnglePrefix({
        anglePassthrough,
        angleExplicit,
        originalSideKeyword,
        angleDeg,
        angleUnit,
      })
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
          buildLinearGradientCss({
            repeating: repSnap,
            anglePrefix: angSnap,
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
    commitGradient({ repeating, stops: nextStops })
  }

  const handleRepeatChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    commitGradient({ repeating: checked, stops })
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
    commitGradient({
      repeating,
      stops: sortStopsByPosition(mirrored),
    })
  }

  const handleSelectedColorChange = (stopId: string, nextColor: string) => {
    const nextStops = stops.map((s) =>
      s.id === stopId ? { ...s, color: nextColor } : s,
    )
    commitGradient({ repeating, stops: nextStops })
  }

  const handleAngleStep = (dir: -1 | 1) => {
    if (anglePassthrough) return
    const step = gradientAngleUnitStep(angleUnit)
    const cur = degreesToUnitValue(angleDeg, angleUnit)
    const nextVal = wrapUnitValue(cur + dir * step, angleUnit)
    const nextDeg = unitValueToDegrees(nextVal, angleUnit)
    commitGradientRaw(repeating, stops, {
      anglePassthrough: null,
      angleExplicit: true,
      originalSideKeyword: null,
      angleDeg: nextDeg,
      angleUnit,
    })
  }

  const handleDialPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (anglePassthrough) return
    if (!event.isPrimary) return
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.preventDefault()
    const shell = event.currentTarget
    shell.setPointerCapture(event.pointerId)

    const computeDeg = (clientX: number, clientY: number): number => {
      const r = shell.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      return pointerVectorToAngleDeg(clientX - cx, clientY - cy)
    }

    let latestDeg = computeDeg(event.clientX, event.clientY)
    setAngleDeg(latestDeg)
    setAngleExplicit(true)
    setOriginalSideKeyword(null)
    setAnglePassthrough(null)

    let finished = false
    const onMove = (ev: PointerEvent) => {
      latestDeg = computeDeg(ev.clientX, ev.clientY)
      setAngleDeg(latestDeg)
    }
    const finish = (ev: PointerEvent) => {
      if (finished) return
      finished = true
      if (shell.hasPointerCapture(ev.pointerId)) {
        shell.releasePointerCapture(ev.pointerId)
      }
      shell.removeEventListener("pointermove", onMove)
      shell.removeEventListener("pointerup", finish)
      shell.removeEventListener("pointercancel", finish)
      commitGradientRaw(repeating, stops, {
        anglePassthrough: null,
        angleExplicit: true,
        originalSideKeyword: null,
        angleDeg: latestDeg,
        angleUnit,
      })
    }
    shell.addEventListener("pointermove", onMove)
    shell.addEventListener("pointerup", finish)
    shell.addEventListener("pointercancel", finish)
  }

  const angleControlsDisabled = !!anglePassthrough

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
      <MenuRow sx={{ alignItems: "center" }}>
        <MenuRowLabel>Angle</MenuRowLabel>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <LinearGradientAngleDialShell
            aria-label="Gradient angle"
            onPointerDown={handleDialPointerDown}
            sx={{
              opacity: angleControlsDisabled ? 0.45 : 1,
              pointerEvents: angleControlsDisabled ? "none" : "auto",
            }}
          >
            <LinearGradientAngleDialRotate style={{ transform: `rotate(${angleDeg}deg)` }}>
              <LinearGradientAngleDialKnob />
            </LinearGradientAngleDialRotate>
          </LinearGradientAngleDialShell>
          <LinearGradientAngleStepButton
            type="button"
            size="small"
            aria-label="Decrease angle"
            disabled={angleControlsDisabled}
            onClick={() => handleAngleStep(-1)}
          >
            <Box component="span" sx={{ display: "inline-flex", transform: "scaleX(-1)" }}>
              <UpdateIcon size={14} fill={COLORS.gray700} />
            </Box>
          </LinearGradientAngleStepButton>
          <LinearGradientAngleStepButton
            type="button"
            size="small"
            aria-label="Increase angle"
            disabled={angleControlsDisabled}
            onClick={() => handleAngleStep(1)}
          >
            <UpdateIcon size={14} fill={COLORS.gray700} />
          </LinearGradientAngleStepButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <CraftSettingsValueWithUnit
              withoutLabel
              label="Angle value"
              value={angleValueWithUnitProp}
              gradientAngleUnits={CRAFT_GRADIENT_ANGLE_UNIT_MENU}
              onCommit={handleAngleValueWithUnitCommit}
              disabled={angleControlsDisabled}
              disableUnitPopperPortal
              customWidth="52px"
              placeholder="0"
              unitAffixVariant="chip"
            />
          </Box>
        </Box>
      </MenuRow>

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
