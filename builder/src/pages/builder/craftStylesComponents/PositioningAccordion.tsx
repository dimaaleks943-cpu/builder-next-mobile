import { useState, type ChangeEvent } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors.ts"
import { CloseIcon } from "../../../icons/CloseIcon.tsx"
import { PositionLeftIcon } from "../../../icons/PositionLeftIcon.tsx"
import { ClearLeftIcon } from "../../../icons/ClearLeftIcon.tsx"
import { ClearIcon } from "../../../icons/ClearIcon.tsx"
import { ChevronDownIcon } from "../../../icons/ChevronDownIcon.tsx"
import { CraftSettingsSelect } from "../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { CraftSettingsButtonGroup } from "../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CRAFT_DISPLAY_NAME } from "../../../craft/craftDisplayNames.ts"
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts"
import { usePreviewViewport } from "../context/PreviewViewportContext.tsx"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../responsiveStyle.ts"

const POSITION_OPTIONS = [
  { id: "static", value: "Static" },
  { id: "relative", value: "Relative" },
  { id: "absolute", value: "Absolute" },
  { id: "fixed", value: "Fixed" },
  { id: "sticky", value: "Sticky" },
] as const

type PositionValue = (typeof POSITION_OPTIONS)[number]["id"]
type FloatValue = "none" | "left" | "right"
type ClearValue = "none" | "left" | "right" | "both"

const POSITION_IDS = new Set<string>(POSITION_OPTIONS.map((o) => o.id))

const iconFill = COLORS.purple400

const uiPosition = (raw: unknown): PositionValue => {
  if (typeof raw === "string" && POSITION_IDS.has(raw)) return raw as PositionValue
  return "static"
}

const uiFloat = (raw: unknown): FloatValue => {
  if (raw === "left" || raw === "right") return raw
  return "none"
}

const uiClear = (raw: unknown): ClearValue => {
  if (raw === "left" || raw === "right" || raw === "both") return raw
  return "none"
}

export const PositioningAccordion = () => {
  const viewport = usePreviewViewport()
  const { actions, selectedId, selectedProps } = useEditor((state) => {
    const [id] = Array.from(state.events.selected)
    const node = id ? state.nodes[id] : null
    const displayName = node ? resolveNodeDisplayName(node) : null
    return {
      selectedId: id ?? null,
      selectedProps: node?.data.props ?? null,
      isBlock: displayName === CRAFT_DISPLAY_NAME.Block,
    }
  })

  const [floatClearOpen, setFloatClearOpen] = useState(false)

  const position = uiPosition(
    getResponsiveStyleProp(selectedProps, "position", viewport),
  )
  const floatValue = uiFloat(
    getResponsiveStyleProp(selectedProps, "float", viewport),
  )
  const clearValue = uiClear(
    getResponsiveStyleProp(selectedProps, "clear", viewport),
  )

  const handlePositionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as PositionValue
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(
        props,
        "position",
        v === "static" ? undefined : v,
        viewport,
      )
    })
  }

  const handleFloatChange = (id: string) => {
    const v = id as FloatValue
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(
        props,
        "float",
        v === "none" ? undefined : v,
        viewport,
      )
    })
  }

  const handleClearChange = (id: string) => {
    const v = id as ClearValue
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(
        props,
        "clear",
        v === "none" ? undefined : v,
        viewport,
      )
    })
  }

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
          Позиционирование
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ paddingTop: 0 }}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <CraftSettingsSelect
            label="Position"
            value={position}
            onChange={handlePositionChange}
            options={[...POSITION_OPTIONS]}
          />

          <Box
            component="button"
            type="button"
            onClick={() => setFloatClearOpen((open) => !open)}
            sx={{
              alignSelf: "stretch",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              padding: "4px",
              borderRadius: "2px",
              border: `1px solid ${COLORS.purple100}`,
              backgroundColor: COLORS.white,
              cursor: "pointer",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                transform: floatClearOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.15s ease",
              }}
            >
              <ChevronDownIcon size={12} fill={COLORS.gray700} />
            </Box>
            <Typography
              sx={{
                fontSize: "10px",
                lineHeight: "14px",
                color: COLORS.gray700,
              }}
            >
              Float and clear
            </Typography>
          </Box>

          {floatClearOpen && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <CraftSettingsButtonGroup
                label="Float"
                value={floatValue}
                options={[
                  {
                    id: "none",
                    content: <CloseIcon size={16} fill={iconFill} />,
                  },
                  {
                    id: "left",
                    content: <PositionLeftIcon width={24} height={16} fill={iconFill} />,
                  },
                  {
                    id: "right",
                    content: (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transform: "scaleX(-1)",
                        }}
                      >
                        <PositionLeftIcon width={24} height={16} fill={iconFill} />
                      </Box>
                    ),
                  },
                ]}
                onChange={handleFloatChange}
              />

              <CraftSettingsButtonGroup
                label="Clear"
                value={clearValue}
                options={[
                  {
                    id: "none",
                    content: <CloseIcon size={16} fill={iconFill} />,
                  },
                  {
                    id: "left",
                    content: <ClearLeftIcon size={16} fill={iconFill} />,
                  },
                  {
                    id: "right",
                    content: (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transform: "scaleX(-1)",
                        }}
                      >
                        <ClearLeftIcon size={16} fill={iconFill} />
                      </Box>
                    ),
                  },
                  {
                    id: "both",
                    content: <ClearIcon size={16} fill={iconFill} />,
                  },
                ]}
                onChange={handleClearChange}
              />
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
