import { useEffect, useRef } from "react"
import { Box } from "@mui/material"
import type { ChangeEvent } from "react"
import { COLORS } from "../../../../theme/colors"
import { CraftSettingsSelect } from "./CraftSettingsSelect"
import type {
  FlexAlignItems,
  FlexFlowOption,
  FlexJustifyContent,
} from "../../../../builder.enum"
import { CraftSettingsFixedLabel } from "./styles.ts"
import { isFlexFlowRowLike } from "../../../../utils/flexFlowDerived.ts"
import {
  CraftFlexAlignGrid
} from "../../craftStylesComponents/LayoutAccordion/components/CraftFlexAlignGrid/CraftFlexAlignGrid.tsx";

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
  const DOUBLE_CLICK_MS = 350
  const pendingClickRef = useRef<{
    row: number
    col: number
    timer: ReturnType<typeof setTimeout>
  } | null>(null)

  const isRowLike = isFlexFlowRowLike(flexFlow)
  const effectiveJustify: FlexJustifyContent = justifyContent ?? "flex-start"
  const effectiveAlign: FlexAlignItems = alignItems ?? "stretch"
  const hasAlign = justifyContent != null || alignItems != null

  const xOptions = isRowLike ? X_OPTIONS_ROW : X_OPTIONS_COLUMN
  const yOptions = isRowLike ? Y_OPTIONS_ROW : Y_OPTIONS_COLUMN
  const xDisplayValue = isRowLike
    ? (effectiveJustify as string)
    : (effectiveAlign as string)
  const yDisplayValue = isRowLike
    ? (effectiveAlign as string)
    : (effectiveJustify as string)

  useEffect(
    () => () => {
      const pending = pendingClickRef.current
      if (pending) {
        clearTimeout(pending.timer)
        pendingClickRef.current = null
      }
    }, [])

  const applySingleFromCell = (rowIndex: number, colIndex: number) => {
    if (isRowLike) {
      onChange(colToJustify(colIndex), rowToAlign(rowIndex))
    } else {
      onChange(rowToJustify(rowIndex), colToAlign(colIndex))
    }
  }

  const applyDoubleFromCell = (rowIndex: number, colIndex: number) => {
    if (isRowLike) {
      onChange("space-between", rowToAlign(rowIndex))
    } else {
      onChange("space-between", colToAlign(colIndex))
    }
  }

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    const pending = pendingClickRef.current
    if (pending) {
      clearTimeout(pending.timer)
      if (pending.row === rowIndex && pending.col === colIndex) {
        pendingClickRef.current = null
        applyDoubleFromCell(rowIndex, colIndex)
        return
      }
      applySingleFromCell(pending.row, pending.col)
      pendingClickRef.current = null
    }
    pendingClickRef.current = {
      row: rowIndex,
      col: colIndex,
      timer: setTimeout(() => {
        pendingClickRef.current = null
        applySingleFromCell(rowIndex, colIndex)
      }, DOUBLE_CLICK_MS),
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "44px 62px 150px",
          gap: "12px",
        }}
      >
        {hasAlign ? (
          <Box
            onClick={handleReset}
            sx={{
              fontSize: "10px",
              lineHeight: "14px",
              minWidth: "48px",
              padding: 0,
              border: "none",
              background: "none",
              cursor: "pointer",
              color: COLORS.purple400,
              textAlign: "left",
            }}
          >
            {label}
          </Box>
        ) : (
          <CraftSettingsFixedLabel>{label}</CraftSettingsFixedLabel>
        )}
        <CraftFlexAlignGrid
          isRowLike={isRowLike}
          justifyContent={justifyContent}
          alignItems={alignItems}
          onCellClick={handleCellClick}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            minWidth: 0,
          }}
        >
          <CraftSettingsSelect
            label="X"
            value={xDisplayValue}
            onChange={handleXChange}
            options={xOptions.map((o) => ({ id: o.id, value: o.value }))}
            labelSx={{ minWidth: "10px", width: "10px" }}
          />
          <CraftSettingsSelect
            label="Y"
            value={yDisplayValue}
            onChange={handleYChange}
            options={yOptions.map((o) => ({ id: o.id, value: o.value }))}
            labelSx={{ minWidth: "10px", width: "10px" }}
          />
        </Box>
      </Box>
    </Box>
  )
}
