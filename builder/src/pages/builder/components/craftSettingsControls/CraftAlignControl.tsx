import { useState } from "react"
import { Box, Typography } from "@mui/material"
import type { ChangeEvent } from "react"
import { COLORS } from "../../../../theme/colors"
import { CraftSettingsSelect } from "./CraftSettingsSelect"
import { Arrows } from "../../../../icons/Arrows.tsx";

type PlaceItemsValue = "start" | "center" | "end" | "stretch" | "baseline"

const X_OPTIONS: { id: string; value: string }[] = [
  { id: "left", value: "Left" },
  { id: "center", value: "Center" },
  { id: "right", value: "Right" },
  { id: "stretch", value: "Stretch" },
  { id: "baseline", value: "Baseline" },
]

const Y_OPTIONS: { id: string; value: string }[] = [
  { id: "top", value: "Top" },
  { id: "center", value: "Center" },
  { id: "bottom", value: "Bottom" },
  { id: "stretch", value: "Stretch" },
  { id: "baseline", value: "Baseline" },
]

/** Маппинг display id (из селекта) -> CSS value: left->start, right->end, top->start, bottom->end */
const DISPLAY_TO_CSS: Record<string, PlaceItemsValue> = {
  left: "start",
  right: "end",
  top: "start",
  bottom: "end",
  center: "center",
  stretch: "stretch",
  baseline: "baseline",
}

const CSS_TO_X_DISPLAY: Record<PlaceItemsValue, string> = {
  start: "left",
  end: "right",
  center: "center",
  stretch: "stretch",
  baseline: "baseline",
}

const CSS_TO_Y_DISPLAY: Record<PlaceItemsValue, string> = {
  start: "top",
  end: "bottom",
  center: "center",
  stretch: "stretch",
  baseline: "baseline",
}

const GRID_POSITIONS: { y: PlaceItemsValue; x: PlaceItemsValue }[][] = [
  [
    { y: "start", x: "start" },
    { y: "start", x: "center" },
    { y: "start", x: "end" },
  ],
  [
    { y: "center", x: "start" },
    { y: "center", x: "center" },
    { y: "center", x: "end" },
  ],
  [
    { y: "end", x: "start" },
    { y: "end", x: "center" },
    { y: "end", x: "end" },
  ],
]

interface Props {
  label: string
  alignY: PlaceItemsValue | undefined
  alignX: PlaceItemsValue | undefined
  onChange: (alignY: PlaceItemsValue, alignX: PlaceItemsValue) => void
}

export const CraftAlignControl = ({
  label,
  alignY,
  alignX,
  onChange,
}: Props) => {
  const [expanded, setExpanded] = useState(false)

  const effectiveY: PlaceItemsValue = alignY ?? "stretch"
  const effectiveX: PlaceItemsValue = alignX ?? "stretch"

  /** place-items задан, если указаны оба значения */
  const hasPlaceItems = alignY != null && alignX != null
  /** Показываем сетку: пользователь раскрыл квадрат или уже задан place-items */
  const showGrid = expanded || hasPlaceItems
  /** Иконка стрелок — только когда place-items не задан */
  const showArrows = !hasPlaceItems && !expanded

  const xDisplayValue = CSS_TO_X_DISPLAY[effectiveX]
  const yDisplayValue = CSS_TO_Y_DISPLAY[effectiveY]

  const isGridPositionSelected = (row: number, col: number) => {
    const pos = GRID_POSITIONS[row][col]
    return pos.y === effectiveY && pos.x === effectiveX
  }

  const handleCellClick = (y: PlaceItemsValue, x: PlaceItemsValue) => {
    onChange(y, x)
  }

  const handleXChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const displayId = e.target.value as string
    const cssValue = DISPLAY_TO_CSS[displayId] ?? displayId
    onChange(effectiveY, cssValue as PlaceItemsValue)
  }

  const handleYChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const displayId = e.target.value as string
    const cssValue = DISPLAY_TO_CSS[displayId] ?? displayId
    onChange(cssValue as PlaceItemsValue, effectiveX)
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
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
        <Box
          component="button"
          type="button"
          onClick={() => setExpanded((v) => !v)}
          sx={{
            width: "58px",
            height: "58px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            border: `1px solid ${COLORS.purple200}`,
            borderRadius: "4px",
            backgroundColor: COLORS.purple100,
            cursor: "pointer",
          }}
        >
          {showGrid ? (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gridTemplateRows: "1fr 1fr 1fr",
                gap: "2px",
                padding: "4px",
                boxSizing: "border-box",
              }}
            >
              {GRID_POSITIONS.map((row, rowIndex) =>
                row.map((pos, colIndex) => {
                  const selected = isGridPositionSelected(rowIndex, colIndex)
                  return (
                    <Box
                      key={`${rowIndex}-${colIndex}`}
                      component="button"
                      type="button"
                      onClick={() => handleCellClick(pos.y, pos.x)}
                      sx={{
                        width: "100%",
                        height: "100%",
                        minWidth: 0,
                        minHeight: 0,
                        padding: 0,
                        border: selected
                          ? `2px solid ${COLORS.white}`
                          : "1px solid transparent",
                        borderRadius: "2px",
                        backgroundColor: selected
                          ? COLORS.gray800
                          : COLORS.gray300,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {selected && (
                        <Box
                          sx={{
                            width: "4px",
                            height: "4px",
                            borderRadius: "1px",
                            backgroundColor: COLORS.white,
                          }}
                        />
                      )}
                    </Box>
                  )
                }),
              )}
            </Box>
          ) : showArrows ? (
            <Arrows />
          ) : null}
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
            options={X_OPTIONS}
          />
          <CraftSettingsSelect
            label="Y"
            value={yDisplayValue}
            onChange={handleYChange}
            options={Y_OPTIONS}
          />
        </Box>
      </Box>
    </Box>
  )
}
