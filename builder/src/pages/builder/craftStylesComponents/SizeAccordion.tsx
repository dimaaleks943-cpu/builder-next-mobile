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
import { CraftSettingsInput } from "../components/craftSettingsControls/CraftSettingsInput.tsx"
import { CraftSettingsValueWithUnit } from "../components/craftSettingsControls/CraftSettingsValueWithUnit.tsx"
import { CraftSettingsButtonGroup } from "../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { useBuilderModeContext } from "../context/BuilderModeContext.tsx"
import { MODE_TYPE } from "../builder.enum.ts"
import { CSS_SIZE_UNITS_RN } from "../../../utils/craftCssSizeProp.ts"

type SizeNumericKey = "minWidth" | "minHeight"
type SizeDimensionKey = "width" | "height"

const OVERFLOW_OPTIONS = [
  { id: "auto", content: "Auto" },
  { id: "hidden", content: "Hidden" },
  { id: "visible", content: "Visible" },
  { id: "scroll", content: "Scroll" },
]

const formatMaxInput = (value: unknown): string => {
  if (value === undefined || value === null) return ""
  if (typeof value === "number") return String(value)
  return String(value)
}

const parseMaxSize = (raw: string): string | number | undefined => {
  const t = raw.trim()
  if (t === "") return undefined
  if (/^none$/i.test(t)) return "none"
  if (/^-?\d*\.?\d+$/.test(t)) return Number(t)
  return t
}

export const SizeAccordion = () => {
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

  const handleNumericSizeChange =
    (key: SizeNumericKey) => (event: ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value
      actions.setProp(selectedId, (props: any) => {
        if (rawValue === "") {
          delete props[key]
          return
        }

        const numericValue = Number(rawValue)
        if (Number.isNaN(numericValue)) {
          delete props[key]
          return
        }

        props[key] = numericValue
      })
    }

  const handleMaxSizeChange =
    (key: "maxWidth" | "maxHeight") => (event: ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value
      actions.setProp(selectedId, (props: any) => {
        const next = parseMaxSize(raw)
        if (next === undefined) delete props[key]
        else props[key] = next
      })
    }

  const handleDimensionCommit =
    (key: SizeDimensionKey) => (next: string | number | undefined) => {
      actions.setProp(selectedId, (props: any) => {
        if (next === undefined) delete props[key]
        else props[key] = next
      })
    }

  const handleOverflowChange = (value: string) => {
    actions.setProp(selectedId, (props: any) => {
      props.overflow = value
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
          Size
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {isRn ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <CraftSettingsValueWithUnit
                label="Width"
                value={selectedProps.width}
                onCommit={handleDimensionCommit("width")}
                allowedUnits={CSS_SIZE_UNITS_RN}
                mode="rn"
              />
              <CraftSettingsValueWithUnit
                label="Height"
                value={selectedProps.height}
                onCommit={handleDimensionCommit("height")}
                allowedUnits={CSS_SIZE_UNITS_RN}
                mode="rn"
              />
              <Box sx={{ gridColumn: "1 / -1" }}>
                <CraftSettingsInput
                  label="Min H"
                  type="number"
                  value={selectedProps.minHeight ?? ""}
                  onChange={handleNumericSizeChange("minHeight")}
                />
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <CraftSettingsValueWithUnit
                label="Width"
                value={selectedProps.width}
                onCommit={handleDimensionCommit("width")}
                mode="web"
              />
              <CraftSettingsValueWithUnit
                label="Height"
                value={selectedProps.height}
                onCommit={handleDimensionCommit("height")}
                mode="web"
              />
              <CraftSettingsInput
                label="Min W"
                type="number"
                value={selectedProps.minWidth ?? ""}
                onChange={handleNumericSizeChange("minWidth")}
              />
              <CraftSettingsInput
                label="Min H"
                type="number"
                value={selectedProps.minHeight ?? ""}
                onChange={handleNumericSizeChange("minHeight")}
              />
              <CraftSettingsInput
                label="Max W"
                type="text"
                placeholder="None"
                value={formatMaxInput(selectedProps.maxWidth)}
                onChange={handleMaxSizeChange("maxWidth")}
              />
              <CraftSettingsInput
                label="Max H"
                type="text"
                placeholder="None"
                value={formatMaxInput(selectedProps.maxHeight)}
                onChange={handleMaxSizeChange("maxHeight")}
              />
            </Box>
          )}

          {!isRn ? (
            <CraftSettingsButtonGroup
              label="Overflow"
              value={selectedProps.overflow ?? "visible"}
              options={OVERFLOW_OPTIONS}
              onChange={handleOverflowChange}
            />
          ) : null}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
