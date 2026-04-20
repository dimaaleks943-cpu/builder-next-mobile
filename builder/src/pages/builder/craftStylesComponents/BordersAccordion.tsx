import type { ChangeEvent } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors.ts"
import { CraftSettingsPercentSliderRow } from "../components/craftSettingsControls/CraftSettingsPercentSliderRow.tsx"
import { CraftSettingsButtonGroup } from "../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsInput } from "../components/craftSettingsControls/CraftSettingsInput.tsx"
import { CraftSettingsColorField } from "../components/craftSettingsControls/CraftSettingsColorField.tsx"
import {
  BorderSidesFrame,
  type BorderSide,
} from "./BorderSidesFrame.tsx"
import { useBorderSidesControl } from "../hooks/useBorderSidesControl.tsx";
import { usePreviewViewport } from "../context/PreviewViewportContext.tsx"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../responsiveStyle.ts"

const BORDER_RADIUS_MAX_PX = 100

const borderRadiusToPercent = (px: number) => {
  const n = Number.isFinite(px) ? px : 0
  return Math.min(100, Math.max(0, Math.round((n / BORDER_RADIUS_MAX_PX) * 100)))
}

const percentToBorderRadius = (percent: number) => {
  const c = Math.min(100, Math.max(0, Number.isFinite(percent) ? percent : 0))
  return Math.round((c / 100) * BORDER_RADIUS_MAX_PX)
}

type BorderStyleUi = "none" | "solid" | "dotted"

const borderStyleForButtonGroup = (value: string | undefined): BorderStyleUi => {
  if (value === "none" || value === "solid" || value === "dotted") return value
  return "solid"
}

export const BordersAccordion = () => {
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

  const { activeSides, toggleSide, toggleAllSides, isSideActive } = useBorderSidesControl(
    selectedId,
    selectedProps,
    actions,
    viewport,
  )

  if (!selectedId || !selectedProps) {
    return null
  }

  const handleRadiusPercentChange = (value: number) => {
    const px = percentToBorderRadius(value)
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "borderRadius", px, viewport)
    })
  }

  const radiusPercent = borderRadiusToPercent(
    (getResponsiveStyleProp(selectedProps, "borderRadius", viewport) as number | undefined) ?? 0,
  )

  const styleGroupValue = borderStyleForButtonGroup(
    getResponsiveStyleProp(selectedProps, "borderStyle", viewport) as string | undefined,
  )

  const handleBorderStyleChange = (id: string) => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "borderStyle", id, viewport)
    })
  }

  const sidesForWidth: BorderSide[] =
    activeSides === "all" ? ["top", "right", "bottom", "left"] : activeSides

  return (
    <Accordion defaultExpanded disableGutters>
      <AccordionSummary
        sx={{
          minHeight: 40,
          "& .MuiAccordionSummary-content": { margin: 0 },
        }}
      >
        <Typography variant="subtitle2" sx={{ color: COLORS.gray700 }}>
          Границы
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <CraftSettingsPercentSliderRow
            label="Radius"
            value={radiusPercent}
            onChange={handleRadiusPercentChange}
          />

          <Box>
            <Typography
              sx={{
                fontSize: "10px",
                lineHeight: "14px",
                color: COLORS.gray700,
                mb: "6px",
                display: "block",
              }}
            >
              Borders
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "31px",
              }}
            >
              <BorderSidesFrame
                activeSides={activeSides}
                isSideActive={isSideActive}
                onToggleSide={toggleSide}
                onToggleAllSides={toggleAllSides}
              />

              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <CraftSettingsButtonGroup
                  label="Style"
                  value={styleGroupValue}
                  onChange={handleBorderStyleChange}
                  options={[
                    { id: "none", content: "×" },
                    { id: "solid", content: "—" },
                    { id: "dotted", content: "⋯" },
                  ]}
                />

                <CraftSettingsInput
                  label="Width"
                  type="number"
                  value={(getResponsiveStyleProp(selectedProps, "borderTopWidth", viewport) as number | undefined) ?? 0}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const next = Number(event.target.value)
                    const safe = Number.isNaN(next) ? 0 : next

                    actions.setProp(selectedId, (props: any) => {
                      if (sidesForWidth.includes("top")) {
                        setResponsiveStyleProp(props, "borderTopWidth", safe, viewport)
                      }
                      if (sidesForWidth.includes("right")) {
                        setResponsiveStyleProp(props, "borderRightWidth", safe, viewport)
                      }
                      if (sidesForWidth.includes("bottom")) {
                        setResponsiveStyleProp(props, "borderBottomWidth", safe, viewport)
                      }
                      if (sidesForWidth.includes("left")) {
                        setResponsiveStyleProp(props, "borderLeftWidth", safe, viewport)
                      }
                    })
                  }}
                />

                <CraftSettingsColorField
                  label="Color"
                  value={(getResponsiveStyleProp(selectedProps, "borderColor", viewport) as string | undefined) ?? "#000000"}
                  onChange={(value) => {
                    actions.setProp(selectedId, (props: any) => {
                      setResponsiveStyleProp(props, "borderColor", value, viewport)
                    })
                  }}
                />

                <CraftSettingsInput
                  label="Opacity"
                  type="number"
                  value={Math.round((((getResponsiveStyleProp(selectedProps, "borderOpacity", viewport) as number | undefined) ?? 1) * 100))}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const next = Number(event.target.value)
                    const safe = Math.min(100, Math.max(0, Number.isNaN(next) ? 0 : next))
                    actions.setProp(selectedId, (props: any) => {
                      setResponsiveStyleProp(props, "borderOpacity", safe / 100, viewport)
                    })
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
