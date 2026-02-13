import type { ChangeEvent } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"

export const TextSettingsAccordion = () => {
  const { actions } = useEditor()
  const { selectedId, selectedProps } = useEditor((state) => {
    const [id] = Array.from(state.events.selected)
    const node = id ? state.nodes[id] : null
    return {
      selectedId: id ?? null,
      selectedProps: node?.data.props ?? null,
    }
  }) as any

  if (!selectedId || !selectedProps) {
    return null
  }

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
    actions.setProp(selectedId, (props: any) => {
      props.text = value
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
          Text Block Settings
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Typography
            variant="caption"
            sx={{ color: COLORS.gray600, mb: 0.5, display: "block" }}
          >
            Содержимое
          </Typography>
          <Box
            component="textarea"
            value={selectedProps?.text ?? ""}
            onChange={handleTextChange}
            sx={{
              width: "100%",
              minHeight: 80,
              borderRadius: 1,
              border: `1px solid ${COLORS.gray300}`,
              backgroundColor: COLORS.white,
              padding: "8px",
              fontSize: 12,
              fontFamily: "inherit",
              outline: "none",
              resize: "vertical",
              "&:focus": {
                borderColor: COLORS.purple400,
              },
            }}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
