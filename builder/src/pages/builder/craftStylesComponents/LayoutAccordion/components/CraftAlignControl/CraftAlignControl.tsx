import { useEffect, useState } from "react"
import type { ChangeEvent, MouseEvent } from "react"
import { Box } from "@mui/material"
import { COLORS } from "../../../../../../theme/colors.ts"
import { CraftSettingsSelect } from "../../../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import {
  CraftSettingsResetLabelWithPopper
} from "../../../../components/craftSettingsControls/CraftSettingsResetLabelWithPopper.tsx"
import { Arrows } from "../../../../../../icons/Arrows.tsx"
import type { PlaceItemsValue } from "../../../../../../builder.enum.ts"
import {
  CraftAlignControlBaselineMark,
  CraftAlignControlCellButton,
  CraftAlignControlDot,
  CraftAlignControlGridHost,
  CraftAlignControlInputsArea,
  CraftAlignControlLabelColumn,
  CraftAlignControlRow,
  CraftAlignControlSelectedInnerSquare,
  CraftAlignControlSelection,
  CraftAlignControlStretchArrowsLayer,
  CraftAlignControlSurface,
} from "./styles.ts"
import { getSelectionGridSpec, placeValueToVisualAxisIndex } from "./utils.ts";
import {
  CSS_TO_X_DISPLAY,
  CSS_TO_Y_DISPLAY,
  DISPLAY_TO_CSS,
  GRID_POSITIONS,
  X_OPTIONS, Y_OPTIONS
} from "./craftAlignControl.const.ts";

interface Props {
  label: string
  /** Сброс place-items через тот же UI, что у остальных craft-настроек */
  labelReset?: {
    hasValue: boolean
    onReset: () => void
  }
  alignY: PlaceItemsValue | undefined
  alignX: PlaceItemsValue | undefined
  /** При вызове с (undefined, undefined) — сброс к дефолту (place-items не задан). */
  onChange: (
    alignY: PlaceItemsValue | undefined,
    alignX: PlaceItemsValue | undefined,
  ) => void
}

export const CraftAlignControl = ({
  label,
  labelReset,
  alignY,
  alignX,
  onChange,
}: Props) => {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (alignY === undefined && alignX === undefined) {
      setExpanded(false)
    }
  }, [alignY, alignX])

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

  const fullStretch = effectiveY === "stretch" && effectiveX === "stretch"
  const selectionSpec = getSelectionGridSpec(effectiveY, effectiveX)
  const hBarRow =
    effectiveX === "stretch" && effectiveY !== "stretch"
      ? placeValueToVisualAxisIndex(effectiveY)
      : null
  const vBarCol =
    effectiveY === "stretch" && effectiveX !== "stretch"
      ? placeValueToVisualAxisIndex(effectiveX)
      : null
  const singleRow =
    effectiveY !== "stretch" && effectiveX !== "stretch"
      ? placeValueToVisualAxisIndex(effectiveY)
      : null
  const singleCol =
    effectiveY !== "stretch" && effectiveX !== "stretch"
      ? placeValueToVisualAxisIndex(effectiveX)
      : null

  const showBaselineMark = effectiveY === "baseline" || effectiveX === "baseline"

  const showDotInCell = (rowIndex: number, colIndex: number) => {
    if (fullStretch) return false
    if (hBarRow != null && rowIndex === hBarRow) return false
    if (vBarCol != null && colIndex === vBarCol) return false
    if (
      singleRow != null &&
      singleCol != null &&
      rowIndex === singleRow &&
      colIndex === singleCol
    )
      return false
    return true
  }

  const handleCellClick = (
    e: MouseEvent<HTMLButtonElement>,
    y: PlaceItemsValue,
    x: PlaceItemsValue,
  ) => {
    e.stopPropagation()
    onChange(y, x)
  }

  const handleCellDoubleClick = (
    e: MouseEvent<HTMLButtonElement>,
    pos: { y: PlaceItemsValue; x: PlaceItemsValue },
  ) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.altKey) {
      onChange("stretch", pos.x)
    } else {
      onChange(pos.y, "stretch")
    }
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

  const handleSurfaceClick = () => {
    if (showArrows) setExpanded(true)
    else if (!hasPlaceItems) setExpanded((v) => !v)
  }

  const selectionContent = selectionSpec && (
    <>
      {showBaselineMark ? (
        <CraftAlignControlBaselineMark>A</CraftAlignControlBaselineMark>
      ) : selectionSpec.showInnerSquare ? (
        <CraftAlignControlSelectedInnerSquare/>
      ) : null}
    </>
  )

  return (
    <CraftAlignControlRow>
      <CraftAlignControlLabelColumn>
        <CraftSettingsResetLabelWithPopper
          kind="labelReset"
          label={label}
          variant="fixed"
          labelReset={labelReset}
        />
      </CraftAlignControlLabelColumn>
      <CraftAlignControlInputsArea>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flex: 1,
            minWidth: 0,
            width: "100%",
          }}
        >
          <CraftAlignControlSurface
            component="div"
            role={showArrows ? "button" : undefined}
            tabIndex={showArrows ? 0 : undefined}
            onClick={handleSurfaceClick}
            onKeyDown={
              showArrows
                ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setExpanded(true)
                  }
                }
                : undefined
            }
          >
            {showGrid && fullStretch ? (
              <CraftAlignControlStretchArrowsLayer>
                <Arrows size={35} fill={COLORS.gray300}/>
              </CraftAlignControlStretchArrowsLayer>
            ) : null}
            {showGrid ? (
              <CraftAlignControlGridHost>
                {selectionSpec ? (
                  <CraftAlignControlSelection
                    $rowStart={selectionSpec.$rowStart}
                    $rowEnd={selectionSpec.$rowEnd}
                    $colStart={selectionSpec.$colStart}
                    $colEnd={selectionSpec.$colEnd}
                  >
                    {selectionContent}
                  </CraftAlignControlSelection>
                ) : null}
                {GRID_POSITIONS.map((row, rowIndex) =>
                  row.map((pos, colIndex) => (
                    <CraftAlignControlCellButton
                      key={`${rowIndex}-${colIndex}`}
                      type="button"
                      onClick={(e) => handleCellClick(e, pos.y, pos.x)}
                      onDoubleClick={(e) => handleCellDoubleClick(e, pos)}
                      sx={{
                        gridRow: `${rowIndex + 1} / ${rowIndex + 2}`,
                        gridColumn: `${colIndex + 1} / ${colIndex + 2}`,
                      }}
                    >
                      {showDotInCell(rowIndex, colIndex) ? (
                        <CraftAlignControlDot/>
                      ) : null}
                    </CraftAlignControlCellButton>
                  )),
                )}
              </CraftAlignControlGridHost>
            ) : showArrows ? (
              <Arrows size={30} fill={COLORS.gray300}/>
            ) : null}
          </CraftAlignControlSurface>
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
              labelSx={{ minWidth: "10px", width: "10px" }}
            />
            <CraftSettingsSelect
              label="Y"
              value={yDisplayValue}
              onChange={handleYChange}
              options={Y_OPTIONS}
              labelSx={{ minWidth: "10px", width: "10px" }}
            />
          </Box>
        </Box>
      </CraftAlignControlInputsArea>
    </CraftAlignControlRow>
  )
}
