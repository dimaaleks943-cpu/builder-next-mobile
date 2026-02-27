import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material"
import type { ChangeEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import { CraftSettingsSelect } from "../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { CraftSettingsInput } from "../components/craftSettingsControls/CraftSettingsInput.tsx"
import { CraftSettingsButtonGroup } from "../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsMultiToggleGroup } from "../components/craftSettingsControls/CraftSettingsMultiToggleGroup.tsx"
import { CraftSettingsColorField } from "../components/craftSettingsControls/CraftSettingsColorField.tsx"

interface SelectedTypographyProps {
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  fontWeight?: "normal" | "bold";
  textAlign?: "left" | "center" | "right";
  color?: string;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  strokeColor?: string;
  strokeWidth?: number;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
}

interface EditorSelection {
  selectedId: string | null;
  selectedProps: SelectedTypographyProps | null;
}

export const TypographyAccordion = () => {
  const { actions } = useEditor()
  const { selectedId, selectedProps } = useEditor(
    (state): EditorSelection => {
      const [id] = Array.from(state.events.selected)
      const node = id ? state.nodes[id] : null
      return {
        selectedId: id ?? null,
        selectedProps: (node?.data.props as SelectedTypographyProps) ?? null,
      }
    },
  )

  if (!selectedId || !selectedProps) {
    return null
  }

  const [colorDraft, setColorDraft] = useState<string>(
    selectedProps.color ?? COLORS.black,
  )
  const [strokeColorDraft, setStrokeColorDraft] = useState<string>(
    selectedProps.strokeColor ?? COLORS.black,
  )

  const colorTimeoutRef = useRef<number | undefined>(undefined)
  const strokeColorTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    setColorDraft(selectedProps.color ?? COLORS.black)
  }, [selectedProps.color, selectedId])

  useEffect(() => {
    setStrokeColorDraft(selectedProps.strokeColor ?? COLORS.black)
  }, [selectedProps.strokeColor, selectedId])

  const scheduleColorUpdate = (value: string) => {
    if (!selectedId) return
    if (colorTimeoutRef.current !== undefined) {
      window.clearTimeout(colorTimeoutRef.current)
    }
    colorTimeoutRef.current = window.setTimeout(() => {
      actions.setProp(selectedId, (props: any) => {
        props.color = value
      })
    }, 200)
  }

  const scheduleStrokeColorUpdate = (value: string) => {
    if (!selectedId) return
    if (strokeColorTimeoutRef.current !== undefined) {
      window.clearTimeout(strokeColorTimeoutRef.current)
    }
    strokeColorTimeoutRef.current = window.setTimeout(() => {
      actions.setProp(selectedId, (props: any) => {
        props.strokeColor = value
      })
    }, 200)
  }

  const handleFontFamilyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    actions.setProp(selectedId, (props: any) => {
      props.fontFamily = value === "system" ? undefined : value
    })
  }

  const handleFontWeightChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value === "bold" ? "bold" : "normal"
    actions.setProp(selectedId, (props: any) => {
      props.fontWeight = value
    })
  }

  const handleFontSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? undefined : next
    actions.setProp(selectedId, (props: any) => {
      props.fontSize = safe
    })
  }

  const handleLineHeightChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? undefined : next
    actions.setProp(selectedId, (props: any) => {
      props.lineHeight = safe
    })
  }

  const handleColorChange = (value: string) => {
    setColorDraft(value)
    scheduleColorUpdate(value)
  }

  const handleAlignChange = (align: "left" | "center" | "right") => {
    actions.setProp(selectedId, (props: any) => {
      props.textAlign = align
    })
  }

  const handleCapitalizeChange = (
    transform: "none" | "uppercase" | "lowercase" | "capitalize",
  ) => {
    actions.setProp(selectedId, (props: any) => {
      props.textTransform = transform
    })
  }

  const handleStrokeWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? 0 : next
    actions.setProp(selectedId, (props: any) => {
      props.strokeWidth = safe
    })
  }

  const handleStrokeColorChange = (value: string) => {
    setStrokeColorDraft(value)
    scheduleStrokeColorUpdate(value)
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
          Типографика
        </Typography>
      </AccordionSummary>
      <AccordionDetails>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <CraftSettingsSelect
            label="Font"
            value={selectedProps.fontFamily ?? "system"}
            onChange={handleFontFamilyChange}
            options={[
              { id: "system", value: "System" },
              { id: "Roboto", value: "Roboto" },
              { id: "Inter", value: "Inter" },
            ]}
          />

          <CraftSettingsSelect
            label="Weight"
            value={selectedProps.fontWeight ?? "normal"}
            onChange={handleFontWeightChange}
            options={[
              { id: "normal", value: "400 - Normal" },
              { id: "bold", value: "700 - Bold" },
            ]}
          />

          {/* Size / Height */}
          <Box sx={{ display: "flex", gap: "8px" }}>
            <CraftSettingsInput
              label="Size"
              type="number"
              value={selectedProps.fontSize ?? ""}
              onChange={handleFontSizeChange}
              customStyles={{ columnGap: "36px" }}
            />

            <CraftSettingsInput
              label="Height"
              type="number"
              value={selectedProps.lineHeight ?? ""}
              onChange={handleLineHeightChange}
              customStyles={{ columnGap: "34px" }}
            />
          </Box>

          {/* Color */}
          <CraftSettingsColorField
            label="Color"
            value={colorDraft}
            onChange={handleColorChange}
          />

          {/* Align */}
          <CraftSettingsButtonGroup
            label="Align"
            value={selectedProps.textAlign ?? "left"}
            options={[
              { id: "left", content: "≡" },
              { id: "center", content: "≡" },
              { id: "right", content: "≡" },
            ]}
            onChange={(id) =>
              handleAlignChange(id as "left" | "center" | "right")
            }
          />

          <CraftSettingsMultiToggleGroup
            label="Format"
            values={[
              selectedProps.isStrikethrough ? "strike" : "",
              selectedProps.isUnderline ? "underline" : "",
              selectedProps.isItalic ? "italic" : "",
            ].filter(Boolean)}
            options={[
              { id: "strike", content: "S" },
              { id: "underline", content: "U" },
              { id: "italic", content: "I" },
            ]}
            onChange={(next) => {
              actions.setProp(selectedId, (props: any) => {
                props.isStrikethrough = next.includes("strike")
                props.isUnderline = next.includes("underline")
                props.isItalic = next.includes("italic")
              })
            }}
          />

          {/* Capitalize */}
          <CraftSettingsButtonGroup
            label="Capitalize"
            value={selectedProps.textTransform ?? "none"}
            options={[
              { id: "none", content: "x" },
              { id: "uppercase", content: "AA" },
              { id: "capitalize", content: "Aa" },
              { id: "lowercase", content: "aa" },
            ]}
            onChange={(id) =>
              handleCapitalizeChange(
                id as "none" | "uppercase" | "capitalize" | "lowercase",
              )
            }
          />

          {/* Stroke */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "102px 1fr",
              gap: "8px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <CraftSettingsInput
              label="Stroke"
              type="number"
              value={selectedProps.strokeWidth ?? 0}
              onChange={handleStrokeWidthChange}
              customStyles={{ columnGap: "26px" }}
            />

            <CraftSettingsColorField
              label="Color"
              value={strokeColorDraft}
              onChange={handleStrokeColorChange}
            />
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

