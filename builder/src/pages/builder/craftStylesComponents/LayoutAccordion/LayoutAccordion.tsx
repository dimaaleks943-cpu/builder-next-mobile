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

const gridTemplateColumnsToCount = (raw: unknown): number | undefined => {
  if (typeof raw !== "string") return undefined
  const m = /^repeat\((\d+)\s*,\s*minmax\(0\s*,\s*1fr\)\)$/i.exec(raw.trim())
  return m?.[1] ? Number(m[1]) : undefined
}

const gridTemplateRowsToCount = (raw: unknown): number | undefined => {
  if (typeof raw !== "string") return undefined
  const m = /^repeat\((\d+)\s*,\s*auto\)$/i.exec(raw.trim())
  return m?.[1] ? Number(m[1]) : undefined
}

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
      const tpl =
        safe != null && safe > 0
          ? `repeat(${safe}, minmax(0, 1fr))`
          : undefined
      setResponsiveStyleProp(props, "gridTemplateColumns", tpl, viewport)
      setResponsiveStyleProp(props, "itemsPerRow", safe, viewport)
    })
  }

  const handleGridRowsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? undefined : next
    actions.setProp(selectedId, (props: any) => {
      const tpl =
        safe != null && safe > 0 ? `repeat(${safe}, auto)` : undefined
      setResponsiveStyleProp(props, "gridTemplateRows", tpl, viewport)
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
        setResponsiveStyleProp(props, "justifyContent", undefined, viewport)
        setResponsiveStyleProp(props, "alignItems", undefined, viewport)
      } else {
        if (justifyContent != null) {
          setResponsiveStyleProp(props, "justifyContent", justifyContent, viewport)
        }
        if (alignItems != null) {
          setResponsiveStyleProp(props, "alignItems", alignItems, viewport)
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
        setResponsiveStyleProp(props, "placeItems", undefined, viewport)
      } else if (alignY != null && alignX != null) {
        setResponsiveStyleProp(props, "placeItems", `${alignY} ${alignX}`, viewport)
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
    "justifyContent",
    viewport,
  ) as FlexJustifyContent | undefined
  const effectiveFlexAlign = getResponsiveStyleProp(
    selectedProps,
    "alignItems",
    viewport,
  ) as FlexAlignItems | undefined

  const rawPlaceItems = getResponsiveStyleProp(
    selectedProps,
    "placeItems",
    viewport,
  )
  const { y: effectivePlaceItemsY, x: effectivePlaceItemsX } =
    parsePlaceItemsString(rawPlaceItems)

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
                  value={
                    gridTemplateColumnsToCount(
                      getResponsiveStyleProp(
                        selectedProps,
                        "gridTemplateColumns",
                        viewport,
                      ),
                    ) ?? ""
                  }
                  onChange={handleGridColumnsChange}
                />
                <CraftSettingsInput
                  label="Rows"
                  type="number"
                  value={
                    gridTemplateRowsToCount(
                      getResponsiveStyleProp(
                        selectedProps,
                        "gridTemplateRows",
                        viewport,
                      ),
                    ) ?? ""
                  }
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
