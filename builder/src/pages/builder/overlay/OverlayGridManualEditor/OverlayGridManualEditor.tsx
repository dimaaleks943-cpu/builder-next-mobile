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
  buildGridTemplateColumns,
  buildGridTemplateRows,
  parseGridTemplateColumnTracksForManualOverlay,
  parseGridTemplateColumnsCount,
  parseGridTemplateRowsCount,
} from "../../craftStylesComponents/LayoutAccordion/components/LayoutGridSection/utils.ts"
import {
  GRID_MANUAL_ADD_COL_STRIP_PX,
  GRID_MANUAL_ADD_ROW_STRIP_PX,
  GRID_MANUAL_AUTO_COLUMN_MIN_PX,
  GRID_MANUAL_COL_HEADER_PX,
  GRID_MANUAL_OVERLAY_FALLBACK_GAP_PX,
  GRID_MANUAL_PREVIEW_ROW_MIN_PX,
  GRID_MANUAL_ROW_LABEL_MIN_HEIGHT_FOR_AUTO_PX,
  GRID_MANUAL_ROW_RAIL_PX,
  OverlayGridManualAddColumnAside,
  OverlayGridManualAddColumnWrap,
  OverlayGridManualAddIconButton,
  OverlayGridManualAddRowAside,
  OverlayGridManualAddRowWrap,
  OverlayGridManualColumnLabel,
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
  OverlayGridManualRowLabel,
  OverlayGridManualRowLabelFull,
  OverlayGridManualRowTrack,
  OverlayGridManualRowTrackSingleRow,
  OverlayGridManualRowsRail,
  OverlayGridManualToolbar,
  OverlayGridManualToolbarActions,
  OverlayGridManualToolbarLeft,
  OverlayGridManualToolbarTitle,
} from "./styles.ts"

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

/** Учитываем уже заданный min-height/min-width (inline, CSS), чтобы не занижать пол при ручном режиме. */
const readComputedMinSizePx = (el: HTMLElement, prop: "minHeight" | "minWidth"): number => {
  const v = getComputedStyle(el)[prop] as string
  if (!v || v === "none" || v === "auto" || v === "0px") {
    return 0
  }
  const m = /^(\d+(?:\.\d+)?)px$/i.exec(v.trim())
  return m ? Number(m[1]) : 0
}

interface Props {
  previewViewport: PreviewViewport
  overlayRootElement: HTMLElement | null
  canvasElement: HTMLElement | null
}

interface RowTrackWithAutoLabelProps {
  /** При одном ряду всегда полное «AUTO» и достаточная высота дорожки. */
  singleRowMode: boolean
}

const RowTrackWithAutoLabel = ({ singleRowMode }: RowTrackWithAutoLabelProps) => {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [compact, setCompact] = useState(false)

  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return
    const sync = () => {
      if (singleRowMode) {
        setCompact(false)
        return
      }
      setCompact(
        el.getBoundingClientRect().height <
          GRID_MANUAL_ROW_LABEL_MIN_HEIGHT_FOR_AUTO_PX,
      )
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => {
      ro.disconnect()
    }
  }, [singleRowMode])

  const Track = singleRowMode ? OverlayGridManualRowTrackSingleRow : OverlayGridManualRowTrack
  const Label = singleRowMode ? OverlayGridManualRowLabelFull : OverlayGridManualRowLabel

  return (
    <Track ref={trackRef}>
      <Label>{compact ? "..." : "AUTO"}</Label>
    </Track>
  )
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

  const [colCount, setColCount] = useState(1)
  const [rowCount, setRowCount] = useState(1)

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

  const columnGapPxForMinChromeBody = useMemo(() => {
    if (isGapUnsetLike(effectiveColumnGapCss)) {
      return GRID_MANUAL_OVERLAY_FALLBACK_GAP_PX
    }
    const p = gapToPixelsForLayout(effectiveColumnGapCss)
    return p > 0 ? p : GRID_MANUAL_OVERLAY_FALLBACK_GAP_PX
  }, [effectiveColumnGapCss])

  const minChromeBodyHeightPx = useMemo(
    () =>
      rowCount * GRID_MANUAL_PREVIEW_ROW_MIN_PX +
      Math.max(0, rowCount - 1) * rowGapPxForMinChromeBody,
    [rowCount, rowGapPxForMinChromeBody],
  )

  const geometry = useOverlayGeometryObserver({
    anchorElement,
    overlayRootElement,
    canvasElement,
    updateKey: `${previewViewport}:${openSeq}`,
  })

  const gridDraftCountsRef = useRef({ colCount, rowCount })
  gridDraftCountsRef.current = { colCount, rowCount }

  useEffect(() => {
    if (!activeNodeId) return
    const node = query.node(activeNodeId).get()
    if (!node) {
      closeGridManualEdit()
    }
  }, [activeNodeId, closeGridManualEdit, query])

  useEffect(() => {
    if (!activeNodeId) return
    const node = query.node(activeNodeId).get()
    if (!node) return
    const props = node.data.props as Record<string, unknown>
    const colRaw = getResponsiveStyleProp(props, "gridTemplateColumns", previewViewport)
    const rowRaw = getResponsiveStyleProp(props, "gridTemplateRows", previewViewport)
    setColCount(parseGridTemplateColumnsCount(colRaw) ?? 1)
    setRowCount(parseGridTemplateRowsCount(rowRaw) ?? 1)
  }, [activeNodeId, openSeq, query, previewViewport])

  const flushGridPropsToNode = useCallback(
    (nextColCount: number, nextRowCount: number) => {
      if (!activeNodeId) return
      const cols = buildGridTemplateColumns(nextColCount)
      const rows = buildGridTemplateRows(nextRowCount)
      actions.setProp(activeNodeId, (props: Record<string, unknown>) => {
        if (cols != null) {
          setResponsiveStyleProp(props, "gridTemplateColumns", cols, previewViewport)
        }
        if (rows != null) {
          setResponsiveStyleProp(props, "gridTemplateRows", rows, previewViewport)
        }
        setResponsiveStyleProp(props, "itemsPerRow", nextColCount, previewViewport)
      })
    },
    [activeNodeId, actions, previewViewport],
  )

  const handleAddColumn = useCallback(() => {
    const { colCount: prevCol, rowCount: prevRow } = gridDraftCountsRef.current
    const nextCol = prevCol + 1
    gridDraftCountsRef.current = { colCount: nextCol, rowCount: prevRow }
    setColCount(nextCol)
    flushGridPropsToNode(nextCol, prevRow)
  }, [flushGridPropsToNode])

  const handleAddRow = useCallback(() => {
    const { colCount: prevCol, rowCount: prevRow } = gridDraftCountsRef.current
    const nextRow = prevRow + 1
    gridDraftCountsRef.current = { colCount: prevCol, rowCount: nextRow }
    setRowCount(nextRow)
    flushGridPropsToNode(prevCol, nextRow)
  }, [flushGridPropsToNode])

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

  const manualColumnTracks = useMemo((): ("1fr" | "auto")[] => {
    if (!activeNodeId) {
      return Array.from({ length: colCount }, () => "1fr")
    }
    const node = query.node(activeNodeId).get()
    if (!node) {
      return Array.from({ length: colCount }, () => "1fr")
    }
    const props = node.data.props as Record<string, unknown>
    const colRaw = getResponsiveStyleProp(props, "gridTemplateColumns", previewViewport)
    const parsed = parseGridTemplateColumnTracksForManualOverlay(colRaw)
    if (!parsed || parsed.length === 0) {
      return Array.from({ length: colCount }, () => "1fr")
    }
    if (parsed.length === colCount) {
      return parsed
    }
    return Array.from({ length: colCount }, (_, i) => parsed[i] ?? "1fr")
  }, [activeNodeId, colCount, openSeq, previewViewport, query])

  /** В стили узла Craft `grid-template-rows: auto` не пишет минимальную высоту ряда — якорь схлопывается. Временно поднимаем пол на DOM, чтобы соседние блоки не уезжали под оверлей; снимается в cleanup. */
  useLayoutEffect(() => {
    if (!activeNodeId || !anchorElement) {
      return
    }
    const el = anchorElement
    const prevMinHeight = el.style.minHeight
    const prevMinWidth = el.style.minWidth
    const usedMinH = readComputedMinSizePx(el, "minHeight")
    const usedMinW = readComputedMinSizePx(el, "minWidth")
    const nextMinH = Math.max(minChromeBodyHeightPx, usedMinH)
    el.style.minHeight = `${nextMinH}px`

    const autoColCount = manualColumnTracks.filter((t) => t === "auto").length
    if (autoColCount > 0) {
      const floorW =
        autoColCount * GRID_MANUAL_AUTO_COLUMN_MIN_PX +
        Math.max(0, colCount - 1) * columnGapPxForMinChromeBody
      const nextMinW = Math.max(floorW, usedMinW)
      el.style.minWidth = `${nextMinW}px`
    }

    return () => {
      el.style.minHeight = prevMinHeight
      el.style.minWidth = prevMinWidth
    }
  }, [
    activeNodeId,
    anchorElement,
    colCount,
    columnGapPxForMinChromeBody,
    manualColumnTracks,
    minChromeBodyHeightPx,
    openSeq,
  ])

  const manualGridTemplateColumnsCss = useMemo(
    () =>
      manualColumnTracks
        .map((t) =>
          t === "auto"
            ? `minmax(${GRID_MANUAL_AUTO_COLUMN_MIN_PX}px, 1fr)`
            : "minmax(0, 1fr)",
        )
        .join(" "),
    [manualColumnTracks],
  )

  const manualGridTemplateRowsCss = useMemo(
    () =>
      `repeat(${rowCount}, minmax(${GRID_MANUAL_PREVIEW_ROW_MIN_PX}px, 1fr))`,
    [rowCount],
  )

  const handleDone = () => {
    if (!activeNodeId) return
    flushGridPropsToNode(colCount, rowCount)
    closeGridManualEdit()
  }

  const handleDimmerMouseDown = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
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
              display: "flex",
              flexDirection: "row",
              alignItems: "stretch",
              columnGap: previewColumnGapCss,
            }}
          >
            {Array.from({ length: colCount }, (_, i) => {
              const track = manualColumnTracks[i] ?? "1fr"
              const colIsAuto = track === "auto"
              return (
                <Box
                  key={`col-${i}`}
                  sx={{
                    flex: 1,
                    minWidth: colIsAuto ? GRID_MANUAL_AUTO_COLUMN_MIN_PX : 0,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "stretch",
                  }}
                >
                  <OverlayGridManualColumnTrack sx={{ flex: 1, minWidth: 0 }}>
                    <OverlayGridManualColumnLabel>
                      {colIsAuto ? "AUTO" : "1FR"}
                    </OverlayGridManualColumnLabel>
                  </OverlayGridManualColumnTrack>
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
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              rowGap: previewRowGapCss,
            }}
          >
            {Array.from({ length: rowCount }, (_, i) => (
              <RowTrackWithAutoLabel
                key={`row-${i}`}
                singleRowMode={rowCount === 1}
              />
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
            gridTemplateColumns: manualGridTemplateColumnsCss,
            gridTemplateRows: manualGridTemplateRowsCss,
            columnGap: previewColumnGapCss,
            rowGap: previewRowGapCss,
          }}
        >
          {Array.from({ length: rowCount * colCount }, (_, idx) => {
            const ri = Math.floor(idx / colCount)
            const ci = idx % colCount
            return <OverlayGridManualGridCell key={`cell-${ri}-${ci}`} />
          })}
        </OverlayGridManualGridPreview>
      </OverlayGridManualEditorChrome>
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
