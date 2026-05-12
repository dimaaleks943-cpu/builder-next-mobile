import { type ChangeEvent } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../../theme/colors.ts"
import { CraftSettingsButtonGroup } from "../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsInput } from "../../components/craftSettingsControls/CraftSettingsInput.tsx"
import { LayoutGapControl } from "./components/LayoutGapControl/LayoutGapControl.tsx"
import {
  CraftAlignControl,
} from "../../components/craftSettingsControls/CraftAlignControl.tsx"
import { useBuilderModeContext } from "../../context/BuilderModeContext.tsx"
import { MODE_TYPE } from "../../builder.enum.ts"
import { usePreviewViewport } from "../../context/PreviewViewportContext.tsx"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../../responsiveStyle.ts"
import type {
  PlaceItemsValue,
  FlexFlowOption,
  FlexJustifyContent,
  FlexAlignItems,
  GridAutoFlow,
} from "../../../../builder.enum.ts"
import { CraftFlexAlignControl } from "../../components/craftSettingsControls/CraftFlexAlignControl.tsx"
import {
  LayoutDisplayControl,
  type LayoutDisplayInlineOption,
} from "./components/LayoutDisplayControl/LayoutDisplayControl.tsx"
import { LayoutFlexFlowControl } from "./components/LayoutFlexFlowControl/LayoutFlexFlowControl.tsx"

const LAYOUT_PRIMARY_WEB = [
  { id: "block", content: "Блок" },
  { id: "flex", content: "Флекс" },
  { id: "grid", content: "Сетка" },
] as const

const LAYOUT_PRIMARY_RN = [{ id: "flex", content: "Флекс" }] as const

const LAYOUT_INLINE_OPTIONS: LayoutDisplayInlineOption[] = [
  { value: "none", label: "none" },
  { value: "inline-block", label: "inline-block" },
  { value: "inline-flex", label: "inline-flex" },
  { value: "inline-grid", label: "inline-grid" },
]

const displayIsFlex = (d: string) => d === "flex" || d === "inline-flex"
const displayIsGrid = (d: string) => d === "grid" || d === "inline-grid"

export const LayoutAccordion = () => {
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

  const rawDisplay = getResponsiveStyleProp(selectedProps, "display", viewport) as
    | string
    | undefined
  const displayStr =
    typeof rawDisplay === "string" ? rawDisplay.trim() : ""

  const setDisplayValue = (next: string | undefined) => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "display", next, viewport)
    })
  }

  const handleDisplayChange = (next: string | undefined) => {
    if (isRn) {
      setDisplayValue("flex")
      return
    }
    setDisplayValue(next)
  }

  const showFlexSection = isRn
    ? displayIsFlex(displayStr) || displayIsGrid(displayStr)
    : displayIsFlex(displayStr)
  const showGridSection = !isRn && displayIsGrid(displayStr)

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

  const handleGridAutoFlowChange = (value: GridAutoFlow) => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "gridAutoFlow", value, viewport)
    })
  }

  const handleGapCommit = (next: string | number | undefined) => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "gap", next, viewport)
    })
  }

  const handleFlexFlowChange = (value: FlexFlowOption) => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "flexFlow", value, viewport)
    })
  }

  const handleFlexFlowReset = () => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "flexFlow", undefined, viewport)
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

  const effectiveGridAutoFlow: GridAutoFlow =
    (getResponsiveStyleProp(
      selectedProps,
      "gridAutoFlow",
      viewport,
    ) as GridAutoFlow | undefined) ?? "row"

  const rawFlexFlow = getResponsiveStyleProp(
    selectedProps,
    "flexFlow",
    viewport,
  ) as FlexFlowOption | undefined
  const rawFlexFlowStr =
    rawFlexFlow != null && String(rawFlexFlow).trim() !== ""
      ? (String(rawFlexFlow).trim() as FlexFlowOption)
      : undefined
  const effectiveFlexFlow: FlexFlowOption = rawFlexFlowStr ?? "row"
  const flexFlowHasExplicitStyle = rawFlexFlowStr != null

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
    <Accordion disableGutters>
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
      <AccordionDetails sx={{ padding: "8px" }}>
        <Box sx={{ width: "100%" }}>
          <LayoutDisplayControl
            display={displayStr}
            primaryOptions={[...(isRn ? LAYOUT_PRIMARY_RN : LAYOUT_PRIMARY_WEB)]}
            inlineOptions={LAYOUT_INLINE_OPTIONS}
            onDisplayChange={handleDisplayChange}
            hideInlineRow={isRn}
          />

          {showFlexSection && (
            <Box sx={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <LayoutFlexFlowControl
                label="Direction"
                value={effectiveFlexFlow}
                onChange={handleFlexFlowChange}
                onReset={handleFlexFlowReset}
                hasExplicitStyle={flexFlowHasExplicitStyle}
              />
              <CraftFlexAlignControl
                label="Align"
                flexFlow={effectiveFlexFlow}
                justifyContent={effectiveFlexJustify}
                alignItems={effectiveFlexAlign}
                onChange={handleFlexAlignChange}
              />
              <LayoutGapControl
                value={getResponsiveStyleProp(selectedProps, "gap", viewport)}
                onCommit={handleGapCommit}
              />
            </Box>
          )}

          {showGridSection && (
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
                  value={getResponsiveStyleProp(selectedProps, "gridColumns", viewport) as number | undefined ?? ""}
                  onChange={handleGridColumnsChange}
                />
                <CraftSettingsInput
                  label="Rows"
                  type="number"
                  value={getResponsiveStyleProp(selectedProps, "gridRows", viewport) as number | undefined ?? ""}
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
                onChange={(id) => handleGridAutoFlowChange(id as GridAutoFlow)}
              />

              <CraftAlignControl
                label="Align"
                alignY={effectivePlaceItemsY}
                alignX={effectivePlaceItemsX}
                onChange={handleAlignChange}
              />

              <LayoutGapControl
                value={getResponsiveStyleProp(selectedProps, "gap", viewport)}
                onCommit={handleGapCommit}
              />
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
