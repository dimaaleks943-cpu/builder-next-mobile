import { type ChangeEvent } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material"
import { COLORS } from "../../../../theme/colors.ts"
import { LayoutGapControl } from "./components/LayoutGapControl/LayoutGapControl.tsx"
import { useBuilderModeContext } from "../../context/BuilderModeContext.tsx"
import { MODE_TYPE } from "../../builder.enum.ts"
import { usePreviewViewport } from "../../context/PreviewViewportContext.tsx"
import { setResponsiveStyleProp } from "../../responsiveStyle.ts"
import { useStyleEditing } from "../../hooks/useStyleEditing.ts"
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
import {
  buildGridTemplateColumns,
  buildGridTemplateRows,
} from "./components/LayoutGridSection/utils.ts"
import { useCraftGridManualEditBridge } from "../../context/CraftGridManualEditBridgeContext.tsx"
import { LayoutGridSection } from "./components/LayoutGridSection/LayoutGridSection.tsx"

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

const parsePlaceItemsString = (
  raw: unknown,
): { y: PlaceItemsValue | undefined; x: PlaceItemsValue | undefined } => {
  if (typeof raw !== "string" || !raw.trim()) {
    return { y: undefined, x: undefined }
  }
  const parts = raw.trim().split(/\s+/)
  const y = parts[0] as PlaceItemsValue
  const x = (parts[1] ?? parts[0]) as PlaceItemsValue
  return { y, x }
}

export const LayoutAccordion = () => {
  const modeContext = useBuilderModeContext()
  const isRn = modeContext?.mode === MODE_TYPE.RN
  const viewport = usePreviewViewport()
  const { openGridManualEdit } = useCraftGridManualEditBridge()

  const { selectedId, getStyleProp, setStyleProp, mutateClassStyle } = useStyleEditing()

  if (!selectedId) {
    return null
  }

  const rawDisplay = getStyleProp("display") as
    | string
    | undefined
  const displayStr =
    typeof rawDisplay === "string" ? rawDisplay.trim() : ""

  const setDisplayValue = (next: string | undefined) => {
    setStyleProp("display", next)
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
    const tpl = safe != null && safe > 0 ? buildGridTemplateColumns(safe) : undefined
    mutateClassStyle((draft) => {
      setResponsiveStyleProp(draft, "gridTemplateColumns", tpl, viewport)
      setResponsiveStyleProp(draft, "itemsPerRow", safe, viewport)
    })
  }

  const handleGridRowsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? undefined : next
    const tpl = safe != null && safe > 0 ? buildGridTemplateRows(safe) : undefined
    setStyleProp("gridTemplateRows", tpl)
  }

  const handleGridReset = () => {
    mutateClassStyle((draft) => {
      setResponsiveStyleProp(draft, "gridTemplateColumns", undefined, viewport)
      setResponsiveStyleProp(draft, "gridTemplateRows", undefined, viewport)
      setResponsiveStyleProp(draft, "itemsPerRow", undefined, viewport)
    })
  }

  const handleGridAutoFlowChange = (value: GridAutoFlow) => {
    setStyleProp("gridAutoFlow", value)
  }

  const handleGridAutoFlowReset = () => {
    setStyleProp("gridAutoFlow", undefined)
  }

  const handleGapCommit = (next: string | number | undefined) => {
    setStyleProp("gap", next)
  }

  const handleFlexFlowChange = (value: FlexFlowOption) => {
    setStyleProp("flexFlow", value)
  }

  const handleFlexFlowReset = () => {
    setStyleProp("flexFlow", undefined)
  }

  const handleFlexAlignChange = (
    justifyContent: FlexJustifyContent | undefined,
    alignItems: FlexAlignItems | undefined,
  ) => {
    mutateClassStyle((draft) => {
      if (justifyContent === undefined && alignItems === undefined) {
        setResponsiveStyleProp(draft, "justifyContent", undefined, viewport)
        setResponsiveStyleProp(draft, "alignItems", undefined, viewport)
      } else {
        if (justifyContent != null) {
          setResponsiveStyleProp(draft, "justifyContent", justifyContent, viewport)
        }
        if (alignItems != null) {
          setResponsiveStyleProp(draft, "alignItems", alignItems, viewport)
        }
      }
    })
  }

  const handleAlignChange = (
    alignY: PlaceItemsValue | undefined,
    alignX: PlaceItemsValue | undefined,
  ) => {
    if (alignY === undefined && alignX === undefined) {
      setStyleProp("placeItems", undefined)
    } else if (alignY != null && alignX != null) {
      setStyleProp("placeItems", `${alignY} ${alignX}`)
    }
  }

  const rawGridAutoFlow = getStyleProp("gridAutoFlow") as GridAutoFlow | undefined
  const rawGridAutoFlowStr =
    rawGridAutoFlow != null && String(rawGridAutoFlow).trim() !== ""
      ? (String(rawGridAutoFlow).trim() as GridAutoFlow)
      : undefined
  const gridAutoFlowHasExplicitStyle = rawGridAutoFlowStr != null
  const effectiveGridAutoFlow: GridAutoFlow = rawGridAutoFlowStr ?? "row"

  const rawFlexFlow = getStyleProp("flexFlow") as FlexFlowOption | undefined
  const rawFlexFlowStr =
    rawFlexFlow != null && String(rawFlexFlow).trim() !== ""
      ? (String(rawFlexFlow).trim() as FlexFlowOption)
      : undefined
  const effectiveFlexFlow: FlexFlowOption = rawFlexFlowStr ?? "row"
  const flexFlowHasExplicitStyle = rawFlexFlowStr != null

  const effectiveFlexJustify = getStyleProp("justifyContent") as
    | FlexJustifyContent
    | undefined
  const effectiveFlexAlign = getStyleProp("alignItems") as FlexAlignItems | undefined

  const rawPlaceItems = getStyleProp("placeItems")

  const placeItemsHasExplicitStyle =
    typeof rawPlaceItems === "string" && rawPlaceItems.trim() !== ""
  const { y: effectivePlaceItemsY, x: effectivePlaceItemsX } =
    parsePlaceItemsString(rawPlaceItems)

  const handleAlignReset = () => handleAlignChange(undefined, undefined)

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
                value={getStyleProp("gap")}
                onCommit={handleGapCommit}
              />
            </Box>
          )}

          {showGridSection && (
            <LayoutGridSection
              gridTemplateColumnsRaw={getStyleProp("gridTemplateColumns")}
              gridTemplateRowsRaw={getStyleProp("gridTemplateRows")}
              onGridColumnsChange={handleGridColumnsChange}
              onGridRowsChange={handleGridRowsChange}
              onGridReset={handleGridReset}
              gridAutoFlow={effectiveGridAutoFlow}
              gridAutoFlowHasExplicitStyle={gridAutoFlowHasExplicitStyle}
              onGridAutoFlowChange={handleGridAutoFlowChange}
              onGridAutoFlowReset={handleGridAutoFlowReset}
              alignY={effectivePlaceItemsY}
              alignX={effectivePlaceItemsX}
              onAlignChange={handleAlignChange}
              placeItemsHasExplicitStyle={placeItemsHasExplicitStyle}
              onAlignReset={handleAlignReset}
              gapValue={getStyleProp("gap")}
              onGapCommit={handleGapCommit}
              onGridManualEditOpen={() => {
                openGridManualEdit(selectedId)
              }}
            />
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
