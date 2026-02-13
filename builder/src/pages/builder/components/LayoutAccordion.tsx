import { useState } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"

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

  const handleLayoutChange = (value: LayoutMode) => {
    setLayoutMode(value)
    actions.setProp(selectedId, (props: any) => {
      props.layout = value
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
          <ToggleButtonGroup
            value={selectedProps?.layout ?? layoutMode}
            exclusive
            onChange={(_, value) => {
              if (!value) return
              handleLayoutChange(value)
            }}
            size="small"
            fullWidth
          >
            <ToggleButton
              sx={{
                fontSize: "8px",
                lineHeight: "10px",
                padding: "2px 6px",
              }}
              value="block"
            >
              Блок
            </ToggleButton>
            <ToggleButton
              sx={{
                fontSize: "8px",
                lineHeight: "10px",
                padding: "2px 6px",
              }}
              value="flex"
            >
              Флекс
            </ToggleButton>
            <ToggleButton
              sx={{
                fontSize: "8px",
                lineHeight: "10px",
                padding: "2px 6px",
              }}
              value="grid"
            >
              Сетка
            </ToggleButton>
            <ToggleButton
              sx={{
                fontSize: "8px",
                lineHeight: "10px",
                padding: "2px 6px",
              }}
              value="absolute"
            >
              Абсолют.позиция
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

