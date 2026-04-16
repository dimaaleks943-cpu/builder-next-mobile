import { useEditor } from "@craftjs/core"
import type { CraftOutlineStyleMode } from "../../../craft/craftVisualEffects.ts"
import type { ChangeEvent } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Typography,
} from "@mui/material"
import { COLORS } from "../../../theme/colors.ts"
import { CraftSettingsSelect } from "../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { CRAFT_MIX_BLEND_MODE_OPTIONS } from "../../../craft/craftVisualEffects.ts"
import { CraftSettingsPercentSliderRow } from "../components/craftSettingsControls/CraftSettingsPercentSliderRow.tsx"
import { CraftSettingsButtonGroup } from "../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsInput } from "../components/craftSettingsControls/CraftSettingsInput.tsx"
import { CraftSettingsColorField } from "../components/craftSettingsControls/CraftSettingsColorField.tsx"
import { AddIcon } from "../../../icons/AddIcon.tsx"
import { useBuilderModeContext } from "../context/BuilderModeContext.tsx"
import { MODE_TYPE } from "../builder.enum.ts"

export const EffectsAccordion = () => {
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

  if (!selectedId || !selectedProps) {
    return null
  }

  const outlineMode: CraftOutlineStyleMode =
    selectedProps.outlineStyleMode ?? "none"

  const handleBlendChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    actions.setProp(selectedId, (props: any) => {
      props.mixBlendMode = value
    })
  }

  const handleOpacityChange = (value: number) => {
    actions.setProp(selectedId, (props: any) => {
      props.opacityPercent = value
    })
  }

  const handleOutlineModeChange = (id: string) => {
    actions.setProp(selectedId, (props: any) => {
      props.outlineStyleMode = id
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
          Эффекты
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {!isRn ? (
            <CraftSettingsSelect
              label="Blending"
              value={selectedProps.mixBlendMode ?? "normal"}
              onChange={handleBlendChange}
              options={CRAFT_MIX_BLEND_MODE_OPTIONS}
            />
          ) : null}

          <CraftSettingsPercentSliderRow
            label="Opacity"
            value={selectedProps.opacityPercent ?? 100}
            onChange={handleOpacityChange}
          />

          {!isRn ? (
            <>
              <CraftSettingsButtonGroup
                label="Outline"
                value={outlineMode}
                onChange={handleOutlineModeChange}
                options={[
                  { id: "none", content: "×" },
                  { id: "solid", content: "—" },
                  { id: "dashed", content: "⋯" },
                ]}
              />

              {outlineMode !== "none" && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    width: "100%",
                  }}
                >
                  <CraftSettingsInput
                    label="Width"
                    type="number"
                    value={selectedProps.outlineWidth ?? 0}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const next = Number(event.target.value)
                      const safe = Number.isNaN(next) ? 0 : next
                      actions.setProp(selectedId, (props: any) => {
                        props.outlineWidth = safe
                      })
                    }}
                  />
                  <CraftSettingsInput
                    label="Offset"
                    type="number"
                    value={selectedProps.outlineOffset ?? 0}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const next = Number(event.target.value)
                      const safe = Number.isNaN(next) ? 0 : next
                      actions.setProp(selectedId, (props: any) => {
                        props.outlineOffset = safe
                      })
                    }}
                  />
                  <CraftSettingsColorField
                    label="Color"
                    value={selectedProps.outlineColor ?? "#000000"}
                    onChange={(value) => {
                      actions.setProp(selectedId, (props: any) => {
                        props.outlineColor = value
                      })
                    }}
                  />
                </Box>
              )}
            </>
          ) : null}

          {!isRn ? (
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
                Box shadows
              </Typography>
              <IconButton
                size="small"
                onClick={() => {}}
                sx={{ color: COLORS.purple400, padding: "4px" }}
                aria-label="Add box shadow"
              >
                <AddIcon width={20} height={20} fill={COLORS.purple400} />
              </IconButton>
            </Box>
          ) : null}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
