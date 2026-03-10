import { useState, type ChangeEvent } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import { CraftSettingsButtonGroup } from "../components/craftSettingsControls/CraftSettingsButtonGroup"
import { CraftSettingsInput } from "../components/craftSettingsControls/CraftSettingsInput"
import {
  CraftAlignControl,
  type PlaceItemsValue,
} from "../components/craftSettingsControls/CraftAlignControl"
import { useBuilderModeContext } from "../context/BuilderModeContext"
import { MODE_TYPE } from "../builder.enum"

type LayoutMode = "block" | "flex" | "grid" | "absolute"
type GridFlowOption = "row" | "column"

const LAYOUT_OPTIONS_WEB: { id: LayoutMode; content: string }[] = [
  { id: "block", content: "Блок" },
  { id: "flex", content: "Флекс" },
  { id: "grid", content: "Сетка" },
  { id: "absolute", content: "Абс. позиция" },
]

const LAYOUT_OPTIONS_RN: { id: LayoutMode; content: string }[] = [
  { id: "flex", content: "Флекс" },
]

export const LayoutAccordion = () => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("block")
  const modeContext = useBuilderModeContext()
  const isRn = modeContext?.mode === MODE_TYPE.RN

  const { actions } = useEditor()
  const { selectedId, selectedProps } = useEditor((state) => {
    const [id] = Array.from(state.events.selected)
    const node = id ? state.nodes[id] : null
    return {
      selectedId: id ?? null,
      selectedProps: node?.data.props ?? null,
    }
  }) as any

  if (!selectedId) {
    return null
  }

  const effectiveLayout: LayoutMode =
    (selectedProps?.layout as LayoutMode | undefined) ?? layoutMode

  /** В режиме RN показываем только флекс; значение для UI принудительно "flex". */
  const displayLayout: LayoutMode = isRn ? "flex" : effectiveLayout
  const options = isRn ? LAYOUT_OPTIONS_RN : LAYOUT_OPTIONS_WEB

  const handleLayoutChange = (value: LayoutMode) => {
    setLayoutMode(value)
    actions.setProp(selectedId, (props: any) => {
      props.layout = value
    })
  }

  const handleGridColumnsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? undefined : next
    actions.setProp(selectedId, (props: any) => {
      props.gridColumns = safe
      props.itemsPerRow = safe
    })
  }

  const handleGridRowsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? undefined : next
    actions.setProp(selectedId, (props: any) => {
      props.gridRows = safe
    })
  }

  const handleGridAutoFlowChange = (value: GridFlowOption) => {
    actions.setProp(selectedId, (props: any) => {
      props.gridAutoFlow = value
    })
  }

  const handleGapChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? undefined : next
    actions.setProp(selectedId, (props: any) => {
      props.gap = safe
    })
  }

  const handleAlignChange = (alignY: PlaceItemsValue, alignX: PlaceItemsValue) => {
    actions.setProp(selectedId, (props: any) => {
      props.placeItemsY = alignY
      props.placeItemsX = alignX
    })
  }

  const effectiveGridAutoFlow: GridFlowOption =
    (selectedProps?.gridAutoFlow as GridFlowOption | undefined) ?? "row"

  const effectivePlaceItemsY = selectedProps?.placeItemsY as PlaceItemsValue | undefined
  const effectivePlaceItemsX = selectedProps?.placeItemsX as PlaceItemsValue | undefined

  return (
    <Accordion defaultExpanded disableGutters>
      <AccordionSummary
        sx={{
          minHeight: "40px",
          "& .MuiAccordionSummary-content": { margin: 0 },
        }}
      >
        <Typography
          sx={{
            fontSize: "12px",
            lineHeight: "16px",
            color: COLORS.gray700,
          }}
        >
          Расположение
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ width: "100%" }}>
          <CraftSettingsButtonGroup
            withoutLabel
            label="Layout"
            value={displayLayout}
            options={options}
            onChange={(id) => handleLayoutChange(id as LayoutMode)}
          />

          {!isRn && effectiveLayout === "grid" && (
            <Box
              sx={{
                marginTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <Box sx={{ display: "flex", gap: "8px" }}>
                <CraftSettingsInput
                  label="Columns"
                  type="number"
                  value={selectedProps?.gridColumns ?? ""}
                  onChange={handleGridColumnsChange}
                />
                <CraftSettingsInput
                  label="Rows"
                  type="number"
                  value={selectedProps?.gridRows ?? ""}
                  onChange={handleGridRowsChange}
                />
              </Box>

              <CraftSettingsButtonGroup
                label="Direction"
                value={effectiveGridAutoFlow}
                options={[
                  { id: "row", content: "Row" },
                  { id: "column", content: "Column" },
                ]}
                onChange={(id) => handleGridAutoFlowChange(id as GridFlowOption)}
              />

              <CraftAlignControl
                label="Align"
                alignY={effectivePlaceItemsY}
                alignX={effectivePlaceItemsX}
                onChange={handleAlignChange}
              />

              <CraftSettingsInput
                label="Gap"
                type="number"
                value={selectedProps?.gap ?? ""}
                onChange={handleGapChange}
              />
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

