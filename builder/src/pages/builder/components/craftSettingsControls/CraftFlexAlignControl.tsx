import { useRef } from "react"
import { Box, Typography } from "@mui/material"
import type { ChangeEvent } from "react"
import { COLORS } from "../../../../theme/colors"
import { CraftSettingsSelect } from "./CraftSettingsSelect"
import type {
  FlexAlignItems,
  FlexFlowOption,
  FlexJustifyContent,
} from "../../../../builder.enum"
import { Triangle } from "./styles.ts";

const JUSTIFY_VALUES: FlexJustifyContent[] = [
  "flex-start",
  "center",
  "flex-end",
]
const ALIGN_VALUES: FlexAlignItems[] = [
  "flex-start",
  "center",
  "flex-end",
]

/** При row/wrap: X = justify-content. Варианты: left, right, center, space-between, space-around */
const X_OPTIONS_ROW: { id: FlexJustifyContent; value: string }[] = [
  { id: "flex-start", value: "Left" },
  { id: "center", value: "Center" },
  { id: "flex-end", value: "Right" },
  { id: "space-between", value: "Space between" },
  { id: "space-around", value: "Space around" },
]
/** При row/wrap: Y = align-items. Варианты: top, center, bottom, stretch, baseline */
const Y_OPTIONS_ROW: { id: FlexAlignItems; value: string }[] = [
  { id: "flex-start", value: "Top" },
  { id: "center", value: "Center" },
  { id: "flex-end", value: "Bottom" },
  { id: "stretch", value: "Stretch" },
  { id: "baseline", value: "Baseline" },
]
/** При column: X = align-items */
const X_OPTIONS_COLUMN: { id: FlexAlignItems; value: string }[] = [
  { id: "flex-start", value: "Left" },
  { id: "center", value: "Center" },
  { id: "flex-end", value: "Right" },
  { id: "stretch", value: "Stretch" },
  { id: "baseline", value: "Baseline" },
]
/** При column: Y = justify-content */
const Y_OPTIONS_COLUMN: { id: FlexJustifyContent; value: string }[] = [
  { id: "flex-start", value: "Top" },
  { id: "center", value: "Center" },
  { id: "flex-end", value: "Bottom" },
  { id: "space-between", value: "Space between" },
  { id: "space-around", value: "Space around" },
]

/** Для row/wrap: colIndex -> justify-content; rowIndex -> align-items */
const colToJustify = (col: number): FlexJustifyContent =>
  JUSTIFY_VALUES[col] ?? "flex-start"
const rowToAlign = (row: number): FlexAlignItems =>
  ALIGN_VALUES[row] ?? "stretch"
/** Для column: rowIndex -> justify-content; colIndex -> align-items */
const rowToJustify = (row: number): FlexJustifyContent =>
  JUSTIFY_VALUES[row] ?? "flex-start"
const colToAlign = (col: number): FlexAlignItems =>
  ALIGN_VALUES[col] ?? "stretch"

const isLineSelection = (
  justifyContent: FlexJustifyContent | undefined,
  alignItems: FlexAlignItems | undefined,
) =>
  alignItems === "stretch" &&
  justifyContent != null &&
  (JUSTIFY_VALUES as string[]).includes(justifyContent)

/** Позиция центра колонки/ряда в % (контейнер 58px, padding 6px, gap 4px) — чтобы линии проходили ровно по центру точек. */
const LINE_CENTER_PERCENT = [21.24, 50, 78.74]

interface Props {
  label: string
  flexFlow: FlexFlowOption
  justifyContent: FlexJustifyContent | undefined
  alignItems: FlexAlignItems | undefined
  onChange: (
    justifyContent: FlexJustifyContent | undefined,
    alignItems: FlexAlignItems | undefined,
  ) => void
}

export const CraftFlexAlignControl = ({
  label,
  flexFlow,
  justifyContent,
  alignItems,
  onChange,
}: Props) => {
  const lastClickRef = useRef<{ row: number; col: number; time: number } | null>(
    null,
  )
  const DOUBLE_CLICK_MS = 400

  const isRowLike = flexFlow === "row" || flexFlow === "wrap"
  const effectiveJustify: FlexJustifyContent = justifyContent ?? "flex-start"
  const effectiveAlign: FlexAlignItems = alignItems ?? "stretch"
  const hasAlign = justifyContent != null || alignItems != null
  const isSpaceDistributed =
    effectiveJustify === "space-between" || effectiveJustify === "space-around"

  const xOptions = isRowLike ? X_OPTIONS_ROW : X_OPTIONS_COLUMN
  const yOptions = isRowLike ? Y_OPTIONS_ROW : Y_OPTIONS_COLUMN
  const xDisplayValue = isRowLike
    ? (effectiveJustify as string)
    : (effectiveAlign as string)
  const yDisplayValue = isRowLike
    ? (effectiveAlign as string)
    : (effectiveJustify as string)

  const isCellSelected = (rowIndex: number, colIndex: number) => {
    if (isSpaceDistributed) {
      /** space-between / space-around: закрашиваем все точки (и линии по всем колонкам/рядам). */
      return true
    }
    if (isRowLike) {
      const j = colToJustify(colIndex)
      const a = rowToAlign(rowIndex)
      if (isLineSelection(effectiveJustify, effectiveAlign)) {
        return colIndex === JUSTIFY_VALUES.indexOf(effectiveJustify)
      }
      return effectiveJustify === j && effectiveAlign === a
    } else {
      const j = rowToJustify(rowIndex)
      const a = colToAlign(colIndex)
      if (isLineSelection(effectiveJustify, effectiveAlign)) {
        return rowIndex === JUSTIFY_VALUES.indexOf(effectiveJustify)
      }
      return effectiveJustify === j && effectiveAlign === a
    }
  }

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    const now = Date.now()
    const prev = lastClickRef.current
    const isDouble =
      prev &&
      prev.row === rowIndex &&
      prev.col === colIndex &&
      now - prev.time < DOUBLE_CLICK_MS
    lastClickRef.current = { row: rowIndex, col: colIndex, time: now }

    if (isRowLike) {
      if (isDouble) {
        onChange(colToJustify(colIndex), rowToAlign(rowIndex))
      } else {
        onChange(colToJustify(colIndex), "stretch")
      }
    } else {
      if (isDouble) {
        onChange(rowToJustify(rowIndex), colToAlign(colIndex))
      } else {
        onChange(rowToJustify(rowIndex), "stretch")
      }
    }
  }

  const handleXChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as FlexJustifyContent | FlexAlignItems
    if (isRowLike) {
      onChange(value as FlexJustifyContent, effectiveAlign)
    } else {
      onChange(effectiveJustify, value as FlexAlignItems)
    }
  }

  const handleYChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as FlexJustifyContent | FlexAlignItems
    if (isRowLike) {
      onChange(effectiveJustify, value as FlexAlignItems)
    } else {
      onChange(value as FlexJustifyContent, effectiveAlign)
    }
  }

  const handleReset = () => {
    onChange(undefined, undefined)
  }

  /** Линии сквозь выбранный ряд/колонки: при space-between/around — 3 линии (все колонки или все ряды), иначе одна или пусто. */
  const linesToDraw: { type: "vertical" | "horizontal"; index: 0 | 1 | 2 }[] =
    isSpaceDistributed
      ? isRowLike
        ? [
            { type: "vertical", index: 0 },
            { type: "vertical", index: 1 },
            { type: "vertical", index: 2 },
          ]
        : [
            { type: "horizontal", index: 0 },
            { type: "horizontal", index: 1 },
            { type: "horizontal", index: 2 },
          ]
      : isLineSelection(effectiveJustify, effectiveAlign)
        ? isRowLike
          ? [
              {
                type: "vertical",
                index: JUSTIFY_VALUES.indexOf(effectiveJustify) as 0 | 1 | 2,
              },
            ]
          : [
              {
                type: "horizontal",
                index: JUSTIFY_VALUES.indexOf(effectiveJustify) as 0 | 1 | 2,
              },
            ]
        : []

  const showSpaceAroundArrows = isSpaceDistributed && effectiveJustify === "space-around";

  /** просто сетка для отображения компонента, компонент с гридом не работет  */
  const GRID = [
    [0, 1, 2],
    [0, 1, 2],
    [0, 1, 2],
  ]

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {hasAlign ? (
          <Box
            component="button"
            type="button"
            onClick={handleReset}
            sx={{
              fontSize: "10px",
              lineHeight: "14px",
              minWidth: "48px",
              padding: 0,
              border: "none",
              background: "none",
              cursor: "pointer",
              color: COLORS.blue400,
              textAlign: "left",
            }}
          >
            {label}
          </Box>
        ) : (
          <Typography
            sx={{
              fontSize: "10px",
              lineHeight: "14px",
              color: COLORS.gray700,
              minWidth: "48px",
            }}
          >
            {label}
          </Typography>
        )}
        <Box
          sx={{
            position: "relative",
            width: "58px",
            height: "58px",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gridTemplateRows: "1fr 1fr 1fr",
              gap: "4px",
              padding: "6px",
              boxSizing: "border-box",
              border: `1px solid ${COLORS.purple200}`,
              borderRadius: "4px",
              backgroundColor: COLORS.purple100,
            }}
          >
            {GRID.map((_, rowIndex) =>
              [0, 1, 2].map((colIndex) => {
                const selected = isCellSelected(rowIndex, colIndex)
                return (
                  <Box
                    key={`${rowIndex}-${colIndex}`}
                    component="button"
                    type="button"
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    sx={{
                      width: "100%",
                      height: "100%",
                      minWidth: 0,
                      minHeight: 0,
                      padding: 0,
                      border: "none",
                      borderRadius: 0,
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        backgroundColor: selected
                          ? COLORS.gray700
                          : COLORS.gray400,
                      }}
                    />
                  </Box>
                )
              }),
            )}
          </Box>
          {linesToDraw.length > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: "none",
                padding: "6px",
                boxSizing: "border-box",
              }}
            >
              {linesToDraw.map((line, i) =>
                line.type === "vertical" ? (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: `calc(${LINE_CENTER_PERCENT[line.index]}% - 1px)`,
                      width: "2px",
                      backgroundColor: COLORS.gray700,
                    }}
                  />
                ) : (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: `calc(${LINE_CENTER_PERCENT[line.index]}% - 1px)`,
                      height: "2px",
                      backgroundColor: COLORS.gray700,
                    }}
                  />
                ),
              )}
              {showSpaceAroundArrows && (
                <>
                  {isRowLike ? (
                    <>
                      <Triangle
                        sx={{
                          left: "2px",
                          top: "43%",
                          borderTop: "4px solid transparent",
                          borderBottom: "4px solid transparent",
                          borderRight: `6px solid ${COLORS.gray700}`,
                        }}
                      />
                      <Triangle
                        sx={{
                          right: "2px",
                          top: "43%",
                          borderTop: "4px solid transparent",
                          borderBottom: "4px solid transparent",
                          borderLeft: `6px solid ${COLORS.gray700}`,
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Triangle
                        sx={{
                          top: "2px",
                          left: "43%",
                          borderLeft: "4px solid transparent",
                          borderRight: "4px solid transparent",
                          borderBottom: `6px solid ${COLORS.gray700}`,
                        }}
                      />
                      <Triangle
                        sx={{
                          bottom: "2px",
                          left: "43%",
                          borderLeft: "4px solid transparent",
                          borderRight: "4px solid transparent",
                          borderTop: `6px solid ${COLORS.gray700}`,
                        }}
                      />
                    </>
                  )}
                </>
              )}
            </Box>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flex: 1,
            minWidth: 0,
          }}
        >
          <CraftSettingsSelect
            label="X"
            value={xDisplayValue}
            onChange={handleXChange}
            options={xOptions.map((o) => ({ id: o.id, value: o.value }))}
          />
          <CraftSettingsSelect
            label="Y"
            value={yDisplayValue}
            onChange={handleYChange}
            options={yOptions.map((o) => ({ id: o.id, value: o.value }))}
          />
        </Box>
      </Box>
    </Box>
  )
}
