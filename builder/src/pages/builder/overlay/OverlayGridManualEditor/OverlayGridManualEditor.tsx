import { Box } from "@mui/material"
import { useEditor } from "@craftjs/core"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react"
import type { PreviewViewport } from "../../builder.enum.ts"
import { AddIcon } from "../../../../icons/AddIcon.tsx"
import { AppsIcon } from "../../../../icons/AppsIcon.tsx"
import { COLORS } from "../../../../theme/colors.ts"
import { useCraftGridManualEditBridge } from "../../context/CraftGridManualEditBridgeContext.tsx"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../../responsiveStyle.ts"
import { useOverlayGeometryObserver } from "../hooks/useOverlayGeometryObserver.ts"
import { useSelectionHoverCollector } from "../hooks/useSelectionHoverCollector.ts"
import { resolveCraftDomElement } from "../resolveCraftDomElement.ts"
import {
  GRID_MANUAL_ADD_COL_STRIP_PX,
  GRID_MANUAL_ADD_ROW_STRIP_PX,
  GRID_MANUAL_AUTO_COLUMN_MIN_PX,
  GRID_MANUAL_COL_HEADER_PX,
  GRID_MANUAL_OVERLAY_FALLBACK_GAP_PX,
  GRID_MANUAL_PREVIEW_ROW_MIN_PX,
  GRID_MANUAL_ROW_RAIL_PX,
  OverlayGridManualAddColumnAside,
  OverlayGridManualAddColumnWrap,
  OverlayGridManualAddIconButton,
  OverlayGridManualAddRowAside,
  OverlayGridManualAddRowWrap,
  OverlayGridManualColumnAutoFitPrimaryCaption,
  OverlayGridManualColumnLabel,
  OverlayGridManualColumnLabelAutoFitPrimary,
  OverlayGridManualColumnLabelGhost,
  OverlayGridManualColumnTrackGhost,
  OverlayGridManualColumnsHeader,
  OverlayGridManualColumnTrack,
  OverlayGridManualCorner,
  OverlayGridManualDimmer,
  OverlayGridManualDoneAccent,
  OverlayGridManualDoneButton,
  OverlayGridManualEditorChrome,
  OverlayGridManualGridCell,
  OverlayGridManualGridPreview,
  OverlayGridManualRoot,
  OverlayGridManualRowsRail,
  OverlayGridManualToolbar,
  OverlayGridManualToolbarActions,
  OverlayGridManualToolbarLeft,
  OverlayGridManualToolbarTitle,
} from "./styles.ts"
import {
  buildManualGridVisualLabels,
  isAutoFitRepeatTrack,
  measureGridManualRowHeightsPx,
  parseTracksOrFallback, readUsedGridTemplateTracksFromComputed
} from "./utils.ts"
import { RowTrackWithAutoLabel } from "./components/RowTrackWithAutoLabel/RowTrackWithAutoLabel.tsx"
import { OverlayGridManualTrackSettingsPopper } from "./components/OverlayGridManualTrackSettingsPopper/OverlayGridManualTrackSettingsPopper.tsx"
import { UpdateIcon } from "../../../../icons/UpdateIcon.tsx";

/** Значение для MUI `columnGap` / `rowGap` / CSS grid `gap`: 0 или непустая строка (например «10px»). */
const normalizeGridAxisGap = (prefer: unknown, fallback: unknown): string | number => {
  const raw =
    prefer !== undefined && prefer !== null && String(prefer).trim() !== ""
      ? prefer
      : fallback
  if (raw === undefined || raw === null) {
    return 0
  }
  const s = String(raw).trim()
  return s === "" ? 0 : s
}

const isGapUnsetLike = (v: string | number): boolean =>
  v === 0 ||
  v === "0" ||
  v === "0px" ||
  (typeof v === "string" && (v.trim() === "" || v.trim() === "0"))

const gapTokenFromComputedStyle = (raw: string): string | number => {
  const t = raw.trim()
  if (!t || t === "normal" || t === "0px" || t === "0") {
    return 0
  }
  return t
}

const gapToPixelsForLayout = (v: string | number): number => {
  if (typeof v === "number" && Number.isFinite(v)) {
    return v
  }
  const s = String(v).trim()
  const px = /^(\d+(?:\.\d+)?)px$/i.exec(s)
  if (px) {
    return Number(px[1])
  }
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

const rowHeightArraysEqual = (a: number[], b: number[]): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i])

const toOverlayColumnCss = (track: string): string => {
  const t = track.trim()
  if (/^auto$/i.test(t)) {
    return `minmax(${GRID_MANUAL_AUTO_COLUMN_MIN_PX}px, 1fr)`
  }
  return t
}

const toOverlayRowCss = (track: string, measuredPx: number): string => {
  if (/^auto$/i.test(track.trim())) {
    return `${measuredPx}px`
  }
  return track.trim()
}

type TrackSettingsState = {
  axis: "column" | "row"
  index: number
  anchorEl: HTMLElement
}

interface Props {
  previewViewport: PreviewViewport
  overlayRootElement: HTMLElement | null
  canvasElement: HTMLElement | null
}

export const OverlayGridManualEditor = ({
  previewViewport,
  overlayRootElement,
  canvasElement,
}: Props) => {
  const { activeNodeId, openSeq, closeGridManualEdit } = useCraftGridManualEditBridge()

  const selection = useSelectionHoverCollector()

  const {
    actions,
    query,
    gridColumnGapCss,
    gridRowGapCss,
    domFromStore,
  } = useEditor((state) => {
    if (!activeNodeId) {
      return {
        gridColumnGapCss: 0 as const,
        gridRowGapCss: 0 as const,
        domFromStore: null,
      }
    }
    const nodeEntry = state.nodes[activeNodeId]
    const props = nodeEntry?.data?.props as Record<string, unknown> | undefined
    const gap = props ? getResponsiveStyleProp(props, "gap", previewViewport) : undefined
    const columnGap = props
      ? getResponsiveStyleProp(props, "columnGap", previewViewport)
      : undefined
    const rowGap = props ? getResponsiveStyleProp(props, "rowGap", previewViewport) : undefined
    return {
      gridColumnGapCss: normalizeGridAxisGap(columnGap, gap),
      gridRowGapCss: normalizeGridAxisGap(rowGap, gap),
      domFromStore: nodeEntry?.dom ?? null,
    }
  })

  const [anchorFromPoll, setAnchorFromPoll] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    if (!activeNodeId) {
      setAnchorFromPoll(null)
      return
    }
    if (selection?.nodeId === activeNodeId && selection.dom) {
      setAnchorFromPoll(null)
      return
    }
    let cancelled = false
    let frame = 0
    const maxFrames = 90
    const tick = () => {
      if (cancelled) return
      const resolved = resolveCraftDomElement(
        query.node(activeNodeId).get()?.dom ?? null,
      )
      if (resolved) {
        setAnchorFromPoll(resolved)
        return
      }
      frame++
      if (frame < maxFrames) {
        requestAnimationFrame(tick)
      } else {
        setAnchorFromPoll(null)
      }
    }
    requestAnimationFrame(tick)
    return () => {
      cancelled = true
    }
  }, [activeNodeId, openSeq, query, selection?.nodeId, selection?.dom])

  const anchorElement = useMemo(() => {
    if (!activeNodeId) return null
    if (selection?.nodeId === activeNodeId && selection.dom) {
      return selection.dom
    }
    if (anchorFromPoll) {
      return anchorFromPoll
    }
    return resolveCraftDomElement(domFromStore)
  }, [activeNodeId, anchorFromPoll, domFromStore, selection])

  const [gridGapFromDom, setGridGapFromDom] = useState<{
    column: string | number
    row: string | number
  }>({ column: 0, row: 0 })

  useLayoutEffect(() => {
    if (!anchorElement) {
      setGridGapFromDom({ column: 0, row: 0 })
      return
    }
    const sync = () => {
      const cs = getComputedStyle(anchorElement)
      setGridGapFromDom({
        column: gapTokenFromComputedStyle(cs.columnGap),
        row: gapTokenFromComputedStyle(cs.rowGap),
      })
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(anchorElement)
    return () => {
      ro.disconnect()
    }
  }, [anchorElement])

  const effectiveColumnGapCss = useMemo(() => {
    if (!isGapUnsetLike(gridColumnGapCss)) {
      return gridColumnGapCss
    }
    return gridGapFromDom.column
  }, [gridColumnGapCss, gridGapFromDom.column])

  const effectiveRowGapCss = useMemo(() => {
    if (!isGapUnsetLike(gridRowGapCss)) {
      return gridRowGapCss
    }
    return gridGapFromDom.row
  }, [gridRowGapCss, gridGapFromDom.row])

  const [columnTracks, setColumnTracks] = useState<string[]>(["1fr"])
  const [rowTracks, setRowTracks] = useState<string[]>(["auto"])
  const [usedTemplateTracks, setUsedTemplateTracks] = useState<{
    columns: string[]
    rows: string[]
  }>(() => ({ columns: [], rows: [] }))
  const [trackSettings, setTrackSettings] = useState<TrackSettingsState | null>(null)

  const rowCount = rowTracks.length

  const effectiveMeasureRowCount =
    rowTracks.some(isAutoFitRepeatTrack) && usedTemplateTracks.rows.length > 0
      ? usedTemplateTracks.rows.length
      : rowCount

  const columnLabelPlan = useMemo(
    () => buildManualGridVisualLabels(columnTracks, usedTemplateTracks.columns),
    [columnTracks, usedTemplateTracks.columns],
  )

  const rowLabelPlan = useMemo(
    () => buildManualGridVisualLabels(rowTracks, usedTemplateTracks.rows),
    [rowTracks, usedTemplateTracks.rows],
  )

  const visualColCount = Math.max(1, columnLabelPlan.length)

  const previewColumnGapCss = useMemo(
    () =>
      isGapUnsetLike(effectiveColumnGapCss)
        ? `${GRID_MANUAL_OVERLAY_FALLBACK_GAP_PX}px`
        : effectiveColumnGapCss,
    [effectiveColumnGapCss],
  )

  const previewRowGapCss = useMemo(
    () =>
      isGapUnsetLike(effectiveRowGapCss)
        ? `${GRID_MANUAL_OVERLAY_FALLBACK_GAP_PX}px`
        : effectiveRowGapCss,
    [effectiveRowGapCss],
  )

  const rowGapPxForMinChromeBody = useMemo(() => {
    if (isGapUnsetLike(effectiveRowGapCss)) {
      return GRID_MANUAL_OVERLAY_FALLBACK_GAP_PX
    }
    const p = gapToPixelsForLayout(effectiveRowGapCss)
    return p > 0 ? p : GRID_MANUAL_OVERLAY_FALLBACK_GAP_PX
  }, [effectiveRowGapCss])

  const [anchorMeasuredRowHeightsPx, setAnchorMeasuredRowHeightsPx] = useState<number[]>([])

  const overlayManualRowHeightsPx = useMemo(() => {
    if (anchorMeasuredRowHeightsPx.length === effectiveMeasureRowCount) {
      return anchorMeasuredRowHeightsPx
    }
    return Array.from({ length: effectiveMeasureRowCount }, () => GRID_MANUAL_PREVIEW_ROW_MIN_PX)
  }, [anchorMeasuredRowHeightsPx, effectiveMeasureRowCount])

  useLayoutEffect(() => {
    if (!anchorElement || effectiveMeasureRowCount < 1) {
      setAnchorMeasuredRowHeightsPx([])
      return
    }
    const sync = () => {
      const next = measureGridManualRowHeightsPx(
        anchorElement,
        effectiveMeasureRowCount,
        GRID_MANUAL_PREVIEW_ROW_MIN_PX,
        rowGapPxForMinChromeBody,
      )
      setAnchorMeasuredRowHeightsPx((prev) =>
        rowHeightArraysEqual(prev, next) ? prev : next,
      )
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(anchorElement)
    const mo = new MutationObserver(sync)
    mo.observe(anchorElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    })
    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, [
    anchorElement,
    openSeq,
    previewViewport,
    effectiveMeasureRowCount,
    rowGapPxForMinChromeBody,
  ])

  const minChromeBodyHeightPx = useMemo(() => {
    const n = effectiveMeasureRowCount
    const slice = overlayManualRowHeightsPx.slice(0, n)
    const sumRows = slice.reduce((acc, h) => acc + h, 0)
    return sumRows + Math.max(0, n - 1) * rowGapPxForMinChromeBody
  }, [overlayManualRowHeightsPx, effectiveMeasureRowCount, rowGapPxForMinChromeBody])

  useEffect(() => {
    setTrackSettings(null)
  }, [openSeq])

  useEffect(() => {
    if (!activeNodeId) return
    const node = query.node(activeNodeId).get()
    if (!node) return
    const props = node.data.props as Record<string, unknown>
    const colRaw = getResponsiveStyleProp(props, "gridTemplateColumns", previewViewport)
    const rowRaw = getResponsiveStyleProp(props, "gridTemplateRows", previewViewport)
    setColumnTracks(parseTracksOrFallback(colRaw, "column", 1))
    setRowTracks(parseTracksOrFallback(rowRaw, "row", 1))
  }, [activeNodeId, openSeq, previewViewport])

  const commitColumnTrackAt = useCallback(
    (index: number, nextTrack: string) => {
      if (!activeNodeId) return
      setColumnTracks((prev) => {
        const next = prev.map((t, i) => (i === index ? nextTrack : t))
        actions.setProp(activeNodeId, (props: Record<string, unknown>) => {
          setResponsiveStyleProp(props, "gridTemplateColumns", next.join(" "), previewViewport)
          setResponsiveStyleProp(props, "itemsPerRow", next.length, previewViewport)
        })
        return next
      })
    },
    [activeNodeId, actions, previewViewport],
  )

  const commitRowTrackAt = useCallback(
    (index: number, nextTrack: string) => {
      if (!activeNodeId) return
      setRowTracks((prev) => {
        const next = prev.map((t, i) => (i === index ? nextTrack : t))
        actions.setProp(activeNodeId, (props: Record<string, unknown>) => {
          setResponsiveStyleProp(props, "gridTemplateRows", next.join(" "), previewViewport)
        })
        return next
      })
    },
    [activeNodeId, actions, previewViewport],
  )

  const handleAddColumn = useCallback(() => {
    if (!activeNodeId) return
    setColumnTracks((prev) => {
      const next = [...prev, "1fr"]
      actions.setProp(activeNodeId, (props: Record<string, unknown>) => {
        setResponsiveStyleProp(props, "gridTemplateColumns", next.join(" "), previewViewport)
        setResponsiveStyleProp(props, "itemsPerRow", next.length, previewViewport)
      })
      return next
    })
  }, [activeNodeId, actions, previewViewport])

  const handleAddRow = useCallback(() => {
    if (!activeNodeId) return
    setRowTracks((prev) => {
      const next = [...prev, "auto"]
      actions.setProp(activeNodeId, (props: Record<string, unknown>) => {
        setResponsiveStyleProp(props, "gridTemplateRows", next.join(" "), previewViewport)
      })
      return next
    })
  }, [activeNodeId, actions, previewViewport])

  const handleDeleteGridTrack = useCallback(
    (axis: "column" | "row", index: number) => {
      if (!activeNodeId) return
      if (axis === "column") {
        setColumnTracks((prev) => {
          if (prev.length <= 1) return prev
          const next = prev.filter((_, i) => i !== index)
          actions.setProp(activeNodeId, (props: Record<string, unknown>) => {
            setResponsiveStyleProp(props, "gridTemplateColumns", next.join(" "), previewViewport)
            setResponsiveStyleProp(props, "itemsPerRow", next.length, previewViewport)
          })
          return next
        })
        return
      }
      setRowTracks((prev) => {
        if (prev.length <= 1) return prev
        const next = prev.filter((_, i) => i !== index)
        actions.setProp(activeNodeId, (props: Record<string, unknown>) => {
          setResponsiveStyleProp(props, "gridTemplateRows", next.join(" "), previewViewport)
        })
        return next
      })
    },
    [activeNodeId, actions, previewViewport],
  )

  const geometry = useOverlayGeometryObserver({
    anchorElement,
    overlayRootElement,
    canvasElement,
    updateKey: `${previewViewport}:${openSeq}`,
    geometryBox: "content",
  })

  useEffect(() => {
    if (!activeNodeId) return
    const node = query.node(activeNodeId).get()
    if (!node) {
      closeGridManualEdit()
    }
  }, [activeNodeId, closeGridManualEdit, query])

  const chromeLayout = useMemo(() => {
    if (!geometry.isVisible) {
      return null
    }
    const bodyHeightPx = Math.max(geometry.height, minChromeBodyHeightPx)
    return {
      top: geometry.top - GRID_MANUAL_COL_HEADER_PX,
      left: geometry.left - GRID_MANUAL_ROW_RAIL_PX,
      width: geometry.width + GRID_MANUAL_ROW_RAIL_PX + GRID_MANUAL_ADD_COL_STRIP_PX,
      height: bodyHeightPx + GRID_MANUAL_COL_HEADER_PX + GRID_MANUAL_ADD_ROW_STRIP_PX,
    }
  }, [geometry, minChromeBodyHeightPx])

  const manualGridTemplateColumnsCss = useMemo(
    () => columnTracks.map(toOverlayColumnCss).join(" "),
    [columnTracks],
  )

  const manualGridTemplateRowsCss = useMemo(
    () =>
      rowTracks
        .map((t, i) =>
          toOverlayRowCss(t, overlayManualRowHeightsPx[i] ?? GRID_MANUAL_PREVIEW_ROW_MIN_PX),
        )
        .join(" "),
    [rowTracks, overlayManualRowHeightsPx],
  )

  const manualGridAnchorSyncRef = useRef<{ el: HTMLElement; nodeId: string } | null>(null)

  /**
   * Временно выравниваем вёрстку якоря с превью оверлея: подставляем те же `grid-template-*`, что и у сетки в UI.
   * Раньше использовали `min-height`/`min-width` — из-за рассинхрона с дорожками `auto` элементы визуально «уезжали» от пунктира.
   *
   * Cleanup не снимает свойства «в ноль»: React может не вернуть inline-стили при тех же пропсах.
   * Вместо снимка с начала прошлого запуска (рассинхрон при удалении дорожек) подставляем актуальные значения из стора Craft.
   */
  useLayoutEffect(() => {
    if (!activeNodeId || !anchorElement) {
      setUsedTemplateTracks({ columns: [], rows: [] })
      return
    }
    const el = anchorElement
    manualGridAnchorSyncRef.current = { el, nodeId: activeNodeId }
    el.style.gridTemplateColumns = manualGridTemplateColumnsCss
    el.style.gridTemplateRows = manualGridTemplateRowsCss
    setUsedTemplateTracks({
      columns: readUsedGridTemplateTracksFromComputed(el, "columns"),
      rows: readUsedGridTemplateTracksFromComputed(el, "rows"),
    })
    return () => {
      const snap = manualGridAnchorSyncRef.current
      if (!snap) {
        return
      }
      const node = query.node(snap.nodeId).get()
      if (!node) {
        snap.el.style.removeProperty("grid-template-columns")
        snap.el.style.removeProperty("grid-template-rows")
        return
      }
      const props = node.data.props as Record<string, unknown>
      const gtcRaw = getResponsiveStyleProp(props, "gridTemplateColumns", previewViewport)
      const gtrRaw = getResponsiveStyleProp(props, "gridTemplateRows", previewViewport)
      const c = typeof gtcRaw === "string" ? gtcRaw.trim() : ""
      const r = typeof gtrRaw === "string" ? gtrRaw.trim() : ""
      const { el: restoreEl } = snap
      if (c) {
        restoreEl.style.gridTemplateColumns = c
      } else {
        restoreEl.style.removeProperty("grid-template-columns")
      }
      if (r) {
        restoreEl.style.gridTemplateRows = r
      } else {
        restoreEl.style.removeProperty("grid-template-rows")
      }
    }
  }, [
    activeNodeId,
    anchorElement,
    manualGridTemplateColumnsCss,
    manualGridTemplateRowsCss,
    openSeq,
    previewViewport,
    query,
  ])

  const handleDone = () => {
    if (!activeNodeId) return
    actions.setProp(activeNodeId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "gridTemplateColumns", columnTracks.join(" "), previewViewport)
      setResponsiveStyleProp(props, "gridTemplateRows", rowTracks.join(" "), previewViewport)
      setResponsiveStyleProp(props, "itemsPerRow", columnTracks.length, previewViewport)
    })
    closeGridManualEdit()
  }

  const handleDimmerMouseDown = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    setTrackSettings(null)
  }

  if (!activeNodeId) {
    return null
  }

  return (
    <OverlayGridManualRoot>
      <OverlayGridManualDimmer onMouseDown={handleDimmerMouseDown} />
      {chromeLayout ? (
        <OverlayGridManualEditorChrome
          sx={{
            pointerEvents: "auto",
            top: chromeLayout.top,
            left: chromeLayout.left,
            width: chromeLayout.width,
            height: chromeLayout.height,
          }}
          onMouseDown={(event) => {
            event.stopPropagation()
          }}
        >
        <OverlayGridManualCorner />
        <OverlayGridManualColumnsHeader>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              width: "100%",
              display: "grid",
              gridTemplateColumns: manualGridTemplateColumnsCss,
              columnGap: previewColumnGapCss,
              alignItems: "stretch",
            }}
          >
            {columnLabelPlan.map((entry, visualIndex) => {
              const isGhost = entry.kind === "autoFitGhost"
              const isPrimaryAuto = entry.kind === "autoFitPrimary"
              const Track = isGhost ? OverlayGridManualColumnTrackGhost : OverlayGridManualColumnTrack
              return (
                <Box
                  key={`col-${visualIndex}`}
                  sx={{
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "stretch",
                  }}
                >
                  <Track sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      component="button"
                      type="button"
                      onClick={(event: MouseEvent<HTMLButtonElement>) => {
                        setTrackSettings({
                          axis: "column",
                          index: entry.logicalIndex,
                          anchorEl: event.currentTarget,
                        })
                      }}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        border: "none",
                        background: "none",
                        padding: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "stretch",
                        "&:hover": { opacity: 0.92 },
                      }}
                    >
                      {isPrimaryAuto ? (
                        <OverlayGridManualColumnLabelAutoFitPrimary>
                          <UpdateIcon size={12} fill={COLORS.white} />
                          <OverlayGridManualColumnAutoFitPrimaryCaption>
                            {entry.displayLabel}
                          </OverlayGridManualColumnAutoFitPrimaryCaption>
                        </OverlayGridManualColumnLabelAutoFitPrimary>
                      ) : isGhost ? (
                        <OverlayGridManualColumnLabelGhost>
                          {entry.displayLabel}
                        </OverlayGridManualColumnLabelGhost>
                      ) : (
                        <OverlayGridManualColumnLabel>
                          {entry.displayLabel}
                        </OverlayGridManualColumnLabel>
                      )}
                    </Box>
                  </Track>
                </Box>
              )
            })}
          </Box>
        </OverlayGridManualColumnsHeader>

        <OverlayGridManualAddColumnAside>
          <OverlayGridManualAddColumnWrap>
            <OverlayGridManualAddIconButton
              disableRipple
              type="button"
              aria-label="Добавить колонку"
              onClick={handleAddColumn}
            >
              <AddIcon width={16} height={16} fill={COLORS.white} />
            </OverlayGridManualAddIconButton>
          </OverlayGridManualAddColumnWrap>
        </OverlayGridManualAddColumnAside>

        <OverlayGridManualRowsRail>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              width: "100%",
              display: "grid",
              gridTemplateRows: manualGridTemplateRowsCss,
              rowGap: previewRowGapCss,
              alignContent: "start",
            }}
          >
            {rowLabelPlan.map((entry, i) => (
              <Box
                key={`row-${i}`}
                sx={{
                  minHeight: 0,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <RowTrackWithAutoLabel
                  singleRowMode={effectiveMeasureRowCount === 1}
                  label={entry.displayLabel}
                  variant={entry.kind === "autoFitGhost" ? "ghost" : "solid"}
                  showAutoFitIcon={entry.kind === "autoFitPrimary"}
                  onLabelClick={(event: MouseEvent<HTMLButtonElement>) => {
                    setTrackSettings({
                      axis: "row",
                      index: entry.logicalIndex,
                      anchorEl: event.currentTarget,
                    })
                  }}
                />
              </Box>
            ))}
          </Box>
        </OverlayGridManualRowsRail>

        <OverlayGridManualAddRowAside>
          <OverlayGridManualAddRowWrap>
            <OverlayGridManualAddIconButton
              disableRipple
              type="button"
              aria-label="Добавить ряд снизу"
              onClick={handleAddRow}
            >
              <AddIcon width={16} height={16} fill={COLORS.white} />
            </OverlayGridManualAddIconButton>
          </OverlayGridManualAddRowWrap>
        </OverlayGridManualAddRowAside>

        <OverlayGridManualGridPreview
          sx={{
            display: "grid",
            alignContent: "start",
            gridTemplateColumns: manualGridTemplateColumnsCss,
            gridTemplateRows: manualGridTemplateRowsCss,
            columnGap: previewColumnGapCss,
            rowGap: previewRowGapCss,
          }}
        >
          {Array.from({ length: effectiveMeasureRowCount * visualColCount }, (_, idx) => {
            const ri = Math.floor(idx / visualColCount)
            const ci = idx % visualColCount
            return <OverlayGridManualGridCell key={`cell-${ri}-${ci}`} />
          })}
        </OverlayGridManualGridPreview>
      </OverlayGridManualEditorChrome>
      ) : null}

      {trackSettings ? (
        <OverlayGridManualTrackSettingsPopper
          open
          anchorEl={trackSettings.anchorEl}
          axis={trackSettings.axis}
          editIndex={trackSettings.index}
          track={
            trackSettings.axis === "column"
              ? (columnTracks[trackSettings.index] ?? "1fr")
              : (rowTracks[trackSettings.index] ?? "auto")
          }
          columnTracks={columnTracks}
          rowTracks={rowTracks}
          onClose={() => setTrackSettings(null)}
          onCommitTrack={(nextTrack) => {
            if (trackSettings.axis === "column") {
              commitColumnTrackAt(trackSettings.index, nextTrack)
            } else {
              commitRowTrackAt(trackSettings.index, nextTrack)
            }
          }}
          onDelete={() => handleDeleteGridTrack(trackSettings.axis, trackSettings.index)}
        />
      ) : null}

      <OverlayGridManualToolbar
        onMouseDown={(event) => {
          event.stopPropagation()
        }}
      >
        <OverlayGridManualToolbarLeft>
          <AppsIcon size={16} fill={COLORS.gray400} />
          <OverlayGridManualToolbarTitle>Editing Grid</OverlayGridManualToolbarTitle>
        </OverlayGridManualToolbarLeft>
        <OverlayGridManualToolbarActions>
          <OverlayGridManualDoneAccent />
          <OverlayGridManualDoneButton type="button" onClick={handleDone}>
            Done
          </OverlayGridManualDoneButton>
        </OverlayGridManualToolbarActions>
      </OverlayGridManualToolbar>
    </OverlayGridManualRoot>
  )
}
