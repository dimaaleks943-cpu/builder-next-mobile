import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors.ts"
import { CraftSettingsValueWithUnit } from "../components/craftSettingsControls/CraftSettingsValueWithUnit.tsx"
import { CraftSettingsButtonGroup } from "../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { useBuilderModeContext } from "../context/BuilderModeContext.tsx"
import { MODE_TYPE } from "../builder.enum.ts"
import { CSS_SIZE_UNITS_RN } from "../../../utils/craftCssSizeProp.ts"

type SizeFieldKey =
  | "width"
  | "height"
  | "minWidth"
  | "minHeight"
  | "maxWidth"
  | "maxHeight"

const OVERFLOW_OPTIONS = [
  { id: "auto", content: "Auto" },
  { id: "hidden", content: "Hidden" },
  { id: "visible", content: "Visible" },
  { id: "scroll", content: "Scroll" },
]

const SIZE_VALUE_INPUT_WIDTH_PX = "80px";

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

  const handleSizeCommit =
    (key: SizeFieldKey) => (next: string | number | undefined) => {
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

  const inputWidth = SIZE_VALUE_INPUT_WIDTH_PX

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
                onCommit={handleSizeCommit("width")}
                allowedUnits={CSS_SIZE_UNITS_RN}
                mode="rn"
                inputWidth={inputWidth}
              />
              <CraftSettingsValueWithUnit
                label="Height"
                value={selectedProps.height}
                onCommit={handleSizeCommit("height")}
                allowedUnits={CSS_SIZE_UNITS_RN}
                mode="rn"
                inputWidth={inputWidth}
              />
              <Box sx={{ gridColumn: "1 / -1" }}>
                <CraftSettingsValueWithUnit
                  label="Min H"
                  value={selectedProps.minHeight}
                  onCommit={handleSizeCommit("minHeight")}
                  allowedUnits={CSS_SIZE_UNITS_RN}
                  mode="rn"
                  inputWidth={inputWidth}
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
                onCommit={handleSizeCommit("width")}
                mode="web"
                inputWidth={inputWidth}
              />
              <CraftSettingsValueWithUnit
                label="Height"
                value={selectedProps.height}
                onCommit={handleSizeCommit("height")}
                mode="web"
                inputWidth={inputWidth}
              />
              <CraftSettingsValueWithUnit
                label="Min W"
                value={selectedProps.minWidth}
                onCommit={handleSizeCommit("minWidth")}
                mode="web"
                inputWidth={inputWidth}
              />
              <CraftSettingsValueWithUnit
                label="Min H"
                value={selectedProps.minHeight}
                onCommit={handleSizeCommit("minHeight")}
                mode="web"
                inputWidth={inputWidth}
              />
              <CraftSettingsValueWithUnit
                label="Max W"
                value={selectedProps.maxWidth}
                onCommit={handleSizeCommit("maxWidth")}
                mode="web"
                placeholder="None"
                inputWidth={inputWidth}
              />
              <CraftSettingsValueWithUnit
                label="Max H"
                value={selectedProps.maxHeight}
                onCommit={handleSizeCommit("maxHeight")}
                mode="web"
                placeholder="None"
                inputWidth={inputWidth}
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
