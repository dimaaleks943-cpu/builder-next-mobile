import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../../theme/colors.ts"
import { CloseIcon } from "../../../../icons/CloseIcon.tsx"
import { PositionLeftIcon } from "../../../../icons/PositionLeftIcon.tsx"
import { ClearLeftIcon } from "../../../../icons/ClearLeftIcon.tsx"
import { ClearIcon } from "../../../../icons/ClearIcon.tsx"
import { ChevronDownIcon } from "../../../../icons/ChevronDownIcon.tsx"
import { CraftSettingsSelect } from "../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { CraftSettingsButtonGroup } from "../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CRAFT_DISPLAY_NAME } from "../../../../craft/craftDisplayNames.ts"
import { resolveNodeDisplayName } from "../../../../utils/resolveNodeDisplayName.ts"
import { usePreviewViewport } from "../../context/PreviewViewportContext.tsx"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../../responsiveStyle.ts"
import { INSET_OPTIONS } from "./positioningAccordion.const.tsx"
import { InsetControl, type InsetSide } from "./components/InsetControl.tsx"

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

const INSET_SIDE_ORDER: InsetSide[] = ["top", "right", "bottom", "left"]
const NUMERIC_TOKEN_RE = /^-?(?:\d+\.?\d*|\.\d+)$/

const normalizeInsetToken = (token: string): string => {
  const trimmed = token.trim()
  if (trimmed.toLowerCase() === "auto") {
    return "auto"
  }
  if (trimmed === "0") {
    return "0"
  }
  if (NUMERIC_TOKEN_RE.test(trimmed)) {
    return `${trimmed}px`
  }
  return trimmed
}

const expandInsetToSides = (raw: unknown): Record<InsetSide, string> => {
  if (typeof raw !== "string" || raw.trim() === "") {
    return { top: "auto", right: "auto", bottom: "auto", left: "auto" }
  }

  const tokens = raw
    .trim()
    .split(/\s+/)
    .map((token) => normalizeInsetToken(token))

  if (tokens.length === 1) {
    const token = tokens[0]
    return { top: token, right: token, bottom: token, left: token }
  }

  if (tokens.length === 2) {
    return {
      top: tokens[0],
      right: tokens[1],
      bottom: tokens[0],
      left: tokens[1],
    }
  }

  if (tokens.length === 3) {
    return {
      top: tokens[0],
      right: tokens[1],
      bottom: tokens[2],
      left: tokens[1],
    }
  }

  return {
    top: tokens[0],
    right: tokens[1],
    bottom: tokens[2],
    left: tokens[3],
  }
}

const insetSidesToValue = (sides: Record<InsetSide, string>): string => {
  return INSET_SIDE_ORDER.map((side) => sides[side]).join(" ")
}

const formatInsetSideValue = (token: string): string => {
  return token === "auto" ? "Auto" : token
}

const normalizeInsetValue = (raw: unknown): string => {
  return insetSidesToValue(expandInsetToSides(raw))
}

const INSET_VALUE_TO_ID = INSET_OPTIONS.reduce<Record<string, string>>(
  (acc, option) => {
    acc[normalizeInsetValue(option.value)] = option.id
    return acc
  },
  {},
)

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
  const insetValue = getResponsiveStyleProp(selectedProps, "inset", viewport)
  const isInsetAvailable = position !== "static"
  const insetSides = useMemo(() => expandInsetToSides(insetValue), [insetValue])
  const activeInsetId = INSET_VALUE_TO_ID[normalizeInsetValue(insetValue)] ?? ""

  const handlePositionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value as PositionValue
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(
        props,
        "position",
        v === "static" ? undefined : v,
        viewport,
      )
      if (v !== "absolute" && v !== "fixed") {
        setResponsiveStyleProp(props, "inset", undefined, viewport)
      }
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

  const handleInsetSelect = (id: string) => {
    const option = INSET_OPTIONS.find((item) => item.id === id)
    if (!option) {
      return
    }
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "inset", option.value, viewport)
    })
  }

  const handleInsetSideCommit = (side: InsetSide, next: string | number | undefined) => {
    const nextToken =
      next === undefined || next === ""
        ? "auto"
        : normalizeInsetToken(String(next).trim())

    const nextSides = { ...insetSides, [side]: nextToken }

    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "inset", insetSidesToValue(nextSides), viewport)
    })
  }

  const handleInsetPresetClick = (side: InsetSide, preset: string) => {
    handleInsetSideCommit(side, preset)
  }

  const handleInsetReset = (side: InsetSide) => {
    handleInsetSideCommit(side, "auto")
  }

  useEffect(() => {
    if (!isInsetAvailable && insetValue !== undefined) {
      actions.setProp(selectedId, (props: Record<string, unknown>) => {
        setResponsiveStyleProp(props, "inset", undefined, viewport)
      })
    }
  }, [actions, insetValue, isInsetAvailable, selectedId, viewport])

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

          {isInsetAvailable ? (
            <InsetControl
              insetSideOrder={INSET_SIDE_ORDER}
              activeInsetId={activeInsetId}
              insetSides={insetSides}
              formatInsetSideValue={formatInsetSideValue}
              onInsetSelect={handleInsetSelect}
              onInsetSideCommit={handleInsetSideCommit}
              onInsetPresetClick={handleInsetPresetClick}
              onInsetReset={handleInsetReset}
            />
          ) : null}

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
              <ChevronDownIcon size={12} fill={COLORS.gray700}/>
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
                    content: <CloseIcon size={16} fill={COLORS.purple400}/>,
                  },
                  {
                    id: "left",
                    content: <PositionLeftIcon width={24} height={16} fill={COLORS.purple400}/>,
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
                        <PositionLeftIcon width={24} height={16} fill={COLORS.purple400}/>
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
                    content: <CloseIcon size={16} fill={COLORS.purple400}/>,
                  },
                  {
                    id: "left",
                    content: <ClearLeftIcon size={16} fill={COLORS.purple400}/>,
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
                        <ClearLeftIcon size={16} fill={COLORS.purple400}/>
                      </Box>
                    ),
                  },
                  {
                    id: "both",
                    content: <ClearIcon size={16} fill={COLORS.purple400}/>,
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
