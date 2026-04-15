import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Typography,
} from "@mui/material"
import type { ChangeEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors.ts"
import { AddIcon } from "../../../icons/AddIcon.tsx"
import { CraftSettingsColorField } from "../components/craftSettingsControls/CraftSettingsColorField.tsx"
import { CraftSettingsSelect } from "../components/craftSettingsControls/CraftSettingsSelect.tsx"

const DEFAULT_BG_DISPLAY = COLORS.white

export const BackgroundAccordion = () => {
  const { actions } = useEditor()
  const { selectedId, selectedProps } = useEditor((state) => {
    const [id] = Array.from(state.events.selected)
    const node = id ? state.nodes[id] : null
    return {
      selectedId: id ?? null,
      selectedProps: node?.data.props ?? null,
    }
  }) as any

  const [colorDraft, setColorDraft] = useState<string>(DEFAULT_BG_DISPLAY)
  const colorTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    setColorDraft(selectedProps?.backgroundColor ?? DEFAULT_BG_DISPLAY)
  }, [selectedProps?.backgroundColor, selectedId])

  if (!selectedId || !selectedProps) {
    return null
  }

  const scheduleBackgroundColorUpdate = (value: string) => {
    if (!selectedId) return
    if (colorTimeoutRef.current !== undefined) {
      window.clearTimeout(colorTimeoutRef.current)
    }
    colorTimeoutRef.current = window.setTimeout(() => {
      actions.setProp(selectedId, (props: any) => {
        props.backgroundColor = value
      })
    }, 200)
  }

  const handleColorChange = (value: string) => {
    setColorDraft(value)
    scheduleBackgroundColorUpdate(value)
  }

  const handleClipChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    actions.setProp(selectedId, (props: any) => {
      props.backgroundClip = value
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
        <Typography sx={{ color: COLORS.gray700, fontSize: "12px" }}>
          Фон
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography
              sx={{
                fontSize: "10px",
                lineHeight: "14px",
                color: COLORS.gray700,
              }}
            >
              Image & Gradient
            </Typography>
            <IconButton
              size="small"
              onClick={() => {}}
              sx={{ color: COLORS.purple400, padding: "4px" }}
              aria-label="Add image or gradient"
            >
              <AddIcon width={20} height={20} fill={COLORS.purple400} />
            </IconButton>
          </Box>

          <CraftSettingsColorField
            label="Color"
            value={colorDraft}
            onChange={handleColorChange}
          />

          <CraftSettingsSelect
            label="Clipping"
            value={selectedProps.backgroundClip ?? "none"}
            onChange={handleClipChange}
            options={[{ id: "none", value: "None" }]}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
