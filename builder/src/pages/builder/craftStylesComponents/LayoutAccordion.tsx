import { useState, type ChangeEvent } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import { CraftSettingsButtonGroup } from "../components/craftSettingsControls/CraftSettingsButtonGroup"
import { CraftSettingsInput } from "../components/craftSettingsControls/CraftSettingsInput"
import {
  CraftAlignControl,
} from "../components/craftSettingsControls/CraftAlignControl"
import { useBuilderModeContext } from "../context/BuilderModeContext"
import { MODE_TYPE } from "../builder.enum"
import { usePreviewViewport } from "../context/PreviewViewportContext.tsx"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../responsiveStyle.ts"
import type {
  PlaceItemsValue,
  FlexFlowOption,
  FlexJustifyContent,
  FlexAlignItems,
} from "../../../builder.enum"
import { CraftFlexAlignControl } from "../components/craftSettingsControls/CraftFlexAlignControl"

type LayoutMode = "block" | "flex" | "grid" | "absolute"
type GridFlowOption = "row" | "column"

const LAYOUT_OPTIONS_WEB: { id: LayoutMode; content: string }[] = [
  { id: "block", content: "Блок" },
  { id: "flex", content: "Флекс" },
  { id: "grid", content: "Сетка" },
  { id: "absolute", content: "Абс" },
]

const LAYOUT_OPTIONS_RN: { id: LayoutMode; content: string }[] = [
  { id: "flex", content: "Флекс" },
]

export const LayoutAccordion = () => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("block")
  const modeContext = useBuilderModeContext()
  const isRn = modeContext?.mode === MODE_TYPE.RN
  const viewport = usePreviewViewport()

  const { actions } = useEditor()
  const { selectedId, selectedProps } = useEditor((state) => {
    const [id] = Array.from(state.events.selected)
    const node = id ? state.nodes[id] : null
    return {
      selectedId: id ?? null,
      selectedProps: node?.data.props ?? null,
    }
  }) as any

  if (!selectedId) {
    return null
  }

  const effectiveLayout: LayoutMode =
    (getResponsiveStyleProp(
      selectedProps,
      "layout",
      viewport,
    ) as LayoutMode | undefined) ?? layoutMode

  /** В режиме RN показываем только флекс; значение для UI принудительно "flex". */
  const displayLayout: LayoutMode = isRn ? "flex" : effectiveLayout
  const options = isRn ? LAYOUT_OPTIONS_RN : LAYOUT_OPTIONS_WEB

  const handleLayoutChange = (value: LayoutMode) => {
    setLayoutMode(value)
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "layout", value, viewport)
    })
  }

  const handleGridColumnsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? undefined : next
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "gridColumns", safe, viewport)
      setResponsiveStyleProp(props, "itemsPerRow", safe, viewport)
    })
  }

  const handleGridRowsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? undefined : next
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "gridRows", safe, viewport)
    })
  }

  const handleGridAutoFlowChange = (value: GridFlowOption) => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "gridAutoFlow", value, viewport)
    })
  }

  const handleGapChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? undefined : next
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "gap", safe, viewport)
    })
  }

  const handleFlexFlowChange = (value: FlexFlowOption) => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "flexFlow", value, viewport)
    })
  }

  const handleFlexAlignChange = (
    justifyContent: FlexJustifyContent | undefined,
    alignItems: FlexAlignItems | undefined,
  ) => {
    actions.setProp(selectedId, (props: any) => {
      if (justifyContent === undefined && alignItems === undefined) {
        setResponsiveStyleProp(props, "flexJustifyContent", undefined, viewport)
        setResponsiveStyleProp(props, "flexAlignItems", undefined, viewport)
      } else {
        if (justifyContent != null) {
          setResponsiveStyleProp(props, "flexJustifyContent", justifyContent, viewport)
        }
        if (alignItems != null) {
          setResponsiveStyleProp(props, "flexAlignItems", alignItems, viewport)
        }
      }
    })
  }

  const handleAlignChange = (
    alignY: PlaceItemsValue | undefined,
    alignX: PlaceItemsValue | undefined,
  ) => {
    actions.setProp(selectedId, (props: any) => {
      if (alignY === undefined && alignX === undefined) {
        setResponsiveStyleProp(props, "placeItemsY", undefined, viewport)
        setResponsiveStyleProp(props, "placeItemsX", undefined, viewport)
      } else if (alignY != null && alignX != null) {
        setResponsiveStyleProp(props, "placeItemsY", alignY, viewport)
        setResponsiveStyleProp(props, "placeItemsX", alignX, viewport)
      }
    })
  }

  const effectiveGridAutoFlow: GridFlowOption =
    (getResponsiveStyleProp(
      selectedProps,
      "gridAutoFlow",
      viewport,
    ) as GridFlowOption | undefined) ?? "row"

  const effectiveFlexFlow: FlexFlowOption =
    (getResponsiveStyleProp(
      selectedProps,
      "flexFlow",
      viewport,
    ) as FlexFlowOption | undefined) ?? "row"

  const effectiveFlexJustify = getResponsiveStyleProp(
    selectedProps,
    "flexJustifyContent",
    viewport,
  ) as
    | FlexJustifyContent
    | undefined
  const effectiveFlexAlign = getResponsiveStyleProp(
    selectedProps,
    "flexAlignItems",
    viewport,
  ) as
    | FlexAlignItems
    | undefined

  const effectivePlaceItemsY = getResponsiveStyleProp(
    selectedProps,
    "placeItemsY",
    viewport,
  ) as PlaceItemsValue | undefined
  const effectivePlaceItemsX = getResponsiveStyleProp(
    selectedProps,
    "placeItemsX",
    viewport,
  ) as PlaceItemsValue | undefined

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
          Расположение
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ width: "100%" }}>
          <CraftSettingsButtonGroup
            withoutLabel
            label="Layout"
            value={displayLayout}
            options={options}
            onChange={(id) => handleLayoutChange(id as LayoutMode)}
          />

          {effectiveLayout === "flex" && (
            <Box
              sx={{
                marginTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <CraftSettingsButtonGroup
                label="Direction"
                value={effectiveFlexFlow}
                options={[
                  { id: "row", content: "→" },
                  { id: "column", content: "↓" },
                  { id: "wrap", content: "⇅" },
                ]}
                onChange={(id) => handleFlexFlowChange(id as FlexFlowOption)}
              />
              <CraftFlexAlignControl
                label="Align"
                flexFlow={effectiveFlexFlow}
                justifyContent={effectiveFlexJustify}
                alignItems={effectiveFlexAlign}
                onChange={handleFlexAlignChange}
              />
              <CraftSettingsInput
                label="Gap"
                type="number"
                value={getResponsiveStyleProp(selectedProps, "gap", viewport) ?? ""}
                onChange={handleGapChange}
              />
            </Box>
          )}

          {!isRn && effectiveLayout === "grid" && (
            <Box
              sx={{
                marginTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <Box sx={{ display: "flex", gap: "8px" }}>
                <CraftSettingsInput
                  label="Columns"
                  type="number"
                  value={getResponsiveStyleProp(selectedProps, "gridColumns", viewport) ?? ""}
                  onChange={handleGridColumnsChange}
                />
                <CraftSettingsInput
                  label="Rows"
                  type="number"
                  value={getResponsiveStyleProp(selectedProps, "gridRows", viewport) ?? ""}
                  onChange={handleGridRowsChange}
                />
              </Box>

              <CraftSettingsButtonGroup
                label="Direction"
                value={effectiveGridAutoFlow}
                options={[
                  { id: "row", content: "Row" },
                  { id: "column", content: "Column" },
                ]}
                onChange={(id) => handleGridAutoFlowChange(id as GridFlowOption)}
              />

              <CraftAlignControl
                label="Align"
                alignY={effectivePlaceItemsY}
                alignX={effectivePlaceItemsX}
                onChange={handleAlignChange}
              />

              <CraftSettingsInput
                label="Gap"
                type="number"
                value={getResponsiveStyleProp(selectedProps, "gap", viewport) ?? ""}
                onChange={handleGapChange}
              />
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

