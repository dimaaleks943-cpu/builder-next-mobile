import { useState, type ChangeEvent } from "react"
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors.ts"
import { CraftSettingsButtonGroup } from "../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsInput } from "../components/craftSettingsControls/CraftSettingsInput.tsx"

type LayoutMode = "block" | "flex" | "grid" | "absolute"

export const LayoutAccordion = () => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("block")

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
      // Для компонентов с построчной раскладкой (например, ContentList)
      // синхронизируем количество колонок с itemsPerRow
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

  return (
    <Accordion defaultExpanded disableGutters>
      <AccordionSummary
        sx={{
          minHeight: 40,
          "& .MuiAccordionSummary-content": { margin: 0 },
        }}
      >
        <Typography variant="subtitle2" sx={{ color: COLORS.gray700 }}>
          Расположение
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ width: "100%" }}>
          <CraftSettingsButtonGroup
            withoutLabel
            label="Layout"
            value={effectiveLayout}
            options={[
              { id: "block", content: "Блок" },
              { id: "flex", content: "Флекс" },
              { id: "grid", content: "Сетка" },
              { id: "absolute", content: "Абс. позиция" },
            ]}
            onChange={(id) => handleLayoutChange(id as LayoutMode)}
          />

          {effectiveLayout === "grid" && (
            <Box
              sx={{
                marginTop: "12px",
                display: "flex",
                gap: "8px",
              }}
            >
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
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

