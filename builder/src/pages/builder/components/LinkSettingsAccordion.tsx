import type { ChangeEvent } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"

export const LinkSettingsAccordion = () => {
  const { actions } = useEditor()
  const { selectedId, selectedProps } = useEditor((state) => {
    const [id] = Array.from(state.events.selected)
    const node = id ? state.nodes[id] : null
    return {
      selectedId: id ?? null,
      selectedProps: node?.data.props ?? null,
    }
  }) as { selectedId: string | null; selectedProps: { href?: string; openInNewTab?: boolean } | null }

  if (!selectedId || !selectedProps || selectedProps.href === undefined) {
    return null
  }

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    actions.setProp(selectedId, (props: any) => {
      props.href = value
    })
  }

  const handleOpenInNewTabChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    actions.setProp(selectedId, (props: any) => {
      props.openInNewTab = checked
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
          Ссылка
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Box>
            <Typography
              variant="caption"
              sx={{ color: COLORS.gray600, mb: 0.5, display: "block" }}
            >
              URL
            </Typography>
            <Box
              component="input"
              type="text"
              value={selectedProps.href ?? ""}
              onChange={handleUrlChange}
              placeholder="http://www.google.com"
              sx={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px 12px",
                borderRadius: 1,
                border: `1px solid ${COLORS.gray300}`,
                backgroundColor: COLORS.gray100,
                fontSize: 12,
                fontFamily: "inherit",
                outline: "none",
                "&:focus": {
                  borderColor: COLORS.purple400,
                },
              }}
            />
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(selectedProps.openInNewTab)}
                onChange={handleOpenInNewTabChange}
                size="small"
                sx={{
                  color: COLORS.gray600,
                  "&.Mui-checked": {
                    color: COLORS.purple400,
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: COLORS.gray700 }}>
                Открыть в новой вкладке
              </Typography>
            }
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
