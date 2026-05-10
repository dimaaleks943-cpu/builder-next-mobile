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
import { usePreviewViewport } from "../context/PreviewViewportContext.tsx"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../responsiveStyle.ts"

const DEFAULT_BG_DISPLAY = COLORS.white

const CLIPPING_SELECT_OPTIONS = [
  { id: "none", value: "None" },
  { id: "padding-box", value: "Clip background to padding" },
  { id: "content-box", value: "Clip background to content" },
  { id: "text", value: "Clip background to text" },
] as const

const CLIPPING_PRESETS: Record<
  (typeof CLIPPING_SELECT_OPTIONS)[number]["id"],
  { backgroundClip: string; WebkitTextFillColor: string }
> = {
  none: { backgroundClip: "border-box", WebkitTextFillColor: "inherit" },
  "padding-box": { backgroundClip: "padding-box", WebkitTextFillColor: "inherit" },
  "content-box": { backgroundClip: "content-box", WebkitTextFillColor: "inherit" },
  text: { backgroundClip: "text", WebkitTextFillColor: "transparent" },
}

const getBackgroundClippingSelectId = (
  backgroundClip: string | undefined,
  webkitTextFillColor: string | undefined,
): (typeof CLIPPING_SELECT_OPTIONS)[number]["id"] => {
  if (backgroundClip === "text" || webkitTextFillColor === "transparent") {
    return "text"
  }
  if (backgroundClip === "padding-box") return "padding-box"
  if (backgroundClip === "content-box") return "content-box"
  if (backgroundClip === "border-box" || backgroundClip === "none") return "none"
  return "none"
}

export const BackgroundAccordion = () => {
  const { actions } = useEditor()
  const viewport = usePreviewViewport()
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
    setColorDraft(
      (getResponsiveStyleProp(selectedProps, "backgroundColor", viewport) as string | undefined) ??
        DEFAULT_BG_DISPLAY,
    )
  }, [selectedProps, selectedId, viewport])

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
        setResponsiveStyleProp(props, "backgroundColor", value, viewport)
      })
    }, 200)
  }

  const handleColorChange = (value: string) => {
    setColorDraft(value)
    scheduleBackgroundColorUpdate(value)
  }

  const backgroundClipRaw = getResponsiveStyleProp(
    selectedProps,
    "backgroundClip",
    viewport,
  ) as string | undefined
  const webkitTextFillColorRaw = getResponsiveStyleProp(
    selectedProps,
    "WebkitTextFillColor",
    viewport,
  ) as string | undefined
  const clippingSelectId = getBackgroundClippingSelectId(
    backgroundClipRaw,
    webkitTextFillColorRaw,
  )
  const hasClippingOverrides =
    backgroundClipRaw !== undefined || webkitTextFillColorRaw !== undefined

  const handleClipChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectId = event.target.value as keyof typeof CLIPPING_PRESETS
    const preset = CLIPPING_PRESETS[selectId]
    if (!preset) return
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "backgroundClip", preset.backgroundClip, viewport)
      setResponsiveStyleProp(props, "WebkitTextFillColor", preset.WebkitTextFillColor, viewport)
    })
  }

  const handleClipReset = () => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "backgroundClip", undefined, viewport)
      setResponsiveStyleProp(props, "WebkitTextFillColor", undefined, viewport)
    })
  }

  return (
    <Accordion disableGutters>
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
            value={clippingSelectId}
            onChange={handleClipChange}
            options={[...CLIPPING_SELECT_OPTIONS]}
            labelReset={{
              hasValue: hasClippingOverrides,
              onReset: handleClipReset,
            }}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
