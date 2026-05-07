import { useEditor } from "@craftjs/core"
import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material"
import { COLORS } from "../../../../theme/colors.ts"
import { CraftSettingsSelect } from "../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { CRAFT_MIX_BLEND_MODE_OPTIONS } from "../../../../craft/craftVisualEffects.ts"
import { CraftSettingsPercentSliderRow } from "../../components/craftSettingsControls/CraftSettingsPercentSliderRow.tsx"
import { CraftSettingsButtonGroup } from "../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsInput } from "../../components/craftSettingsControls/CraftSettingsInput.tsx"
import { CraftSettingsColorField } from "../../components/craftSettingsControls/CraftSettingsColorField.tsx"
import { CloseIcon } from "../../../../icons/CloseIcon.tsx"
import { DashedIcon } from "../../../../icons/DashedIcon.tsx"
import { MinusIcon } from "../../../../icons/MinusIcon.tsx"
import { MoreHorizontalIcon } from "../../../../icons/MoreHorizontalIcon.tsx"
import { useBuilderModeContext } from "../../context/BuilderModeContext.tsx"
import { MODE_TYPE, type PreviewViewport } from "../../builder.enum.ts"
import { usePreviewViewport } from "../../context/PreviewViewportContext.tsx"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../../responsiveStyle.ts"
import { BoxShadowSettingsPopper } from "./components/BoxShadowSettingsPopper/BoxShadowSettingsPopper.tsx"
import { BoxShadowToolbar } from "./components/BoxShadowToolbar/BoxShadowToolbar.tsx"
import {
  BOX_SHADOW_DRAFT_KEY,
  buildBoxShadow,
  DEFAULT_BOX_SHADOW,
  formatBoxShadowSummary,
  getEffectiveBoxShadowRaw,
  isBoxShadowOnCanvas,
  parseBoxShadowFromProp,
  type BoxShadowParts,
} from "./boxShadowUtils.ts"

type OutlineToolbarMode = "none" | "solid" | "dashed" | "dotted"

const DEFAULT_OUTLINE_COLOR = "#000000"
const DEFAULT_OUTLINE_WIDTH_PX = 2

const OUTLINE_SHORTHAND_RE =
  /^(.*)\s+(solid|dashed|dotted)\s+(\d+(?:\.\d+)?)px\s*$/i

const parseOutlineShorthand = (
  outline: string,
): { color: string; style: Exclude<OutlineToolbarMode, "none">; width: number } | null => {
  const m = outline.match(OUTLINE_SHORTHAND_RE)
  if (!m) return null
  const style = m[2].toLowerCase() as Exclude<OutlineToolbarMode, "none">
  const width = Number(m[3])
  if (Number.isNaN(width)) return null
  return { color: m[1].trim(), style, width }
}

const inferOutlineModeFromString = (outline: string): OutlineToolbarMode => {
  if (/\bdashed\b/i.test(outline)) return "dashed"
  if (/\bdotted\b/i.test(outline)) return "dotted"
  if (/\bsolid\b/i.test(outline)) return "solid"
  return "none"
}

const getOutlineToolbarMode = (
  props: Record<string, unknown>,
  viewport: PreviewViewport,
): OutlineToolbarMode => {
  const raw = getResponsiveStyleProp(props, "outline", viewport)
  if (raw == null || raw === "" || raw === "none") {
    const legacy = getResponsiveStyleProp(props, "outlineStyleMode", viewport) as string | undefined
    if (legacy === "solid" || legacy === "dashed") return legacy
    return "none"
  }
  if (typeof raw !== "string") return "none"
  const parsed = parseOutlineShorthand(raw)
  if (parsed) return parsed.style
  return inferOutlineModeFromString(raw)
}

const getOutlineWidthUi = (props: Record<string, unknown>, viewport: PreviewViewport): number => {
  const raw = getResponsiveStyleProp(props, "outline", viewport)
  if (typeof raw === "string") {
    const parsed = parseOutlineShorthand(raw)
    if (parsed && !Number.isNaN(parsed.width)) return parsed.width
  }
  const legacy = getResponsiveStyleProp(props, "outlineWidth", viewport)
  if (typeof legacy === "number" && !Number.isNaN(legacy)) return legacy
  return DEFAULT_OUTLINE_WIDTH_PX
}

const getOutlineColorUi = (props: Record<string, unknown>, viewport: PreviewViewport): string => {
  const raw = getResponsiveStyleProp(props, "outline", viewport)
  if (typeof raw === "string") {
    const parsed = parseOutlineShorthand(raw)
    if (parsed?.color) return parsed.color
  }
  const legacy = getResponsiveStyleProp(props, "outlineColor", viewport)
  if (typeof legacy === "string" && legacy.length > 0) return legacy
  return DEFAULT_OUTLINE_COLOR
}

const getOutlineOffsetUi = (props: Record<string, unknown>, viewport: PreviewViewport): number => {
  const v = getResponsiveStyleProp(props, "outlineOffset", viewport)
  if (v == null || v === "") return 0
  if (typeof v === "number" && !Number.isNaN(v)) return v
  const s = String(v).trim().match(/^(\d+(?:\.\d+)?)px$/i)
  if (s) return Number(s[1])
  const n = Number(v)
  return Number.isNaN(n) ? 0 : n
}

const clearLegacyOutlineSplitProps = (
  props: Record<string, unknown>,
  viewport: PreviewViewport,
) => {
  setResponsiveStyleProp(props, "outlineStyleMode", undefined, viewport)
  setResponsiveStyleProp(props, "outlineWidth", undefined, viewport)
  setResponsiveStyleProp(props, "outlineColor", undefined, viewport)
}

/** Props/style хранит opacity как CSS 0–1; в UI — проценты 0–100. Значения > 1 считаем легаси (раньше писали проценты как число). */
const opacityStoredToUiPercent = (raw: unknown): number => {
  if (raw == null || raw === "") return 100
  const n = typeof raw === "number" ? raw : Number(raw)
  if (Number.isNaN(n)) return 100
  if (n > 1) return Math.min(100, Math.max(0, n))
  return Math.min(100, Math.max(0, Math.round(n * 100)))
}

export const EffectsAccordion = () => {
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

  const [boxShadowAnchorEl, setBoxShadowAnchorEl] = useState<HTMLElement | null>(null)
  const boxShadowPopperRef = useRef<HTMLDivElement | null>(null)
  const boxShadowWrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!boxShadowAnchorEl) return
    const onDocMouseDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (boxShadowWrapRef.current?.contains(target)) return
      if (boxShadowPopperRef.current?.contains(target)) return
      setBoxShadowAnchorEl(null)
    }
    document.addEventListener("mousedown", onDocMouseDown, true)
    return () => document.removeEventListener("mousedown", onDocMouseDown, true)
  }, [boxShadowAnchorEl])

  if (!selectedId || !selectedProps) {
    return null
  }

  const boxShadowRawEffective = getEffectiveBoxShadowRaw(selectedProps, viewport)
  const hasBoxShadowConfig = boxShadowRawEffective.length > 0
  const boxShadowOnCanvas = isBoxShadowOnCanvas(selectedProps, viewport)
  const boxShadowParts = parseBoxShadowFromProp(
    hasBoxShadowConfig ? boxShadowRawEffective : undefined,
  )
  const boxShadowSummaryLabel = hasBoxShadowConfig
    ? formatBoxShadowSummary(boxShadowParts)
    : ""

  const outlineMode = getOutlineToolbarMode(selectedProps, viewport)
  const outlineIconFill = COLORS.purple400

  const handleBlendChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "mixBlendMode", value, viewport)
    })
  }

  const handleOpacityChange = (percent: number) => {
    const clamped = Math.min(100, Math.max(0, Number.isNaN(percent) ? 0 : percent))
    actions.setProp(selectedId, (props: any) => {
      if (clamped >= 100) {
        setResponsiveStyleProp(props, "opacity", undefined, viewport)
      } else {
        setResponsiveStyleProp(props, "opacity", clamped / 100, viewport)
      }
    })
  }

  const handleOutlineModeChange = (id: string) => {
    actions.setProp(selectedId, (props: any) => {
      clearLegacyOutlineSplitProps(props, viewport)
      if (id === "none") {
        setResponsiveStyleProp(props, "outline", undefined, viewport)
        setResponsiveStyleProp(props, "outlineOffset", undefined, viewport)
        return
      }
      const style = id as Exclude<OutlineToolbarMode, "none">
      setResponsiveStyleProp(
        props,
        "outline",
        `${DEFAULT_OUTLINE_COLOR} ${style} ${DEFAULT_OUTLINE_WIDTH_PX}px`,
        viewport,
      )
    })
  }

  const handleOutlineWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? 0 : next
    if (outlineMode === "none") return
    actions.setProp(selectedId, (props: any) => {
      clearLegacyOutlineSplitProps(props, viewport)
      const color = getOutlineColorUi(selectedProps, viewport)
      setResponsiveStyleProp(
        props,
        "outline",
        `${color} ${outlineMode} ${safe}px`,
        viewport,
      )
    })
  }

  const handleOutlineColorChange = (value: string) => {
    if (outlineMode === "none") return
    actions.setProp(selectedId, (props: any) => {
      clearLegacyOutlineSplitProps(props, viewport)
      const width = getOutlineWidthUi(selectedProps, viewport)
      setResponsiveStyleProp(props, "outline", `${value} ${outlineMode} ${width}px`, viewport)
    })
  }

  const handleOutlineOffsetChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? 0 : next
    actions.setProp(selectedId, (props: any) => {
      if (safe === 0) {
        setResponsiveStyleProp(props, "outlineOffset", undefined, viewport)
      } else {
        setResponsiveStyleProp(props, "outlineOffset", safe, viewport)
      }
    })
  }

  const applyBoxShadowPatch = (patch: Partial<BoxShadowParts>) => {
    actions.setProp(selectedId, (props: any) => {
      const raw = getEffectiveBoxShadowRaw(props, viewport)
      const cur = parseBoxShadowFromProp(raw.length > 0 ? raw : undefined)
      const built = buildBoxShadow({ ...cur, ...patch })
      if (isBoxShadowOnCanvas(props, viewport)) {
        setResponsiveStyleProp(props, "boxShadow", built, viewport)
      } else {
        props[BOX_SHADOW_DRAFT_KEY] = built
      }
    })
  }

  const handleClearBoxShadow = () => {
    actions.setProp(selectedId, (props: any) => {
      delete props[BOX_SHADOW_DRAFT_KEY]
      setResponsiveStyleProp(props, "boxShadow", undefined, viewport)
    })
    setBoxShadowAnchorEl(null)
  }

  const handleToggleBoxShadowCanvas = () => {
    actions.setProp(selectedId, (props: any) => {
      const applied = isBoxShadowOnCanvas(props, viewport)
      const styleVal = getResponsiveStyleProp(props, "boxShadow", viewport)
      const styleStr = typeof styleVal === "string" ? styleVal.trim() : ""

      if (applied && styleStr.length > 0) {
        props[BOX_SHADOW_DRAFT_KEY] = styleStr
        setResponsiveStyleProp(props, "boxShadow", undefined, viewport)
        return
      }

      const draft = props[BOX_SHADOW_DRAFT_KEY]
      if (typeof draft === "string" && draft.trim().length > 0) {
        setResponsiveStyleProp(props, "boxShadow", draft.trim(), viewport)
        delete props[BOX_SHADOW_DRAFT_KEY]
      }
    })
  }

  const toggleBoxShadowPopper = () => {
    if (boxShadowAnchorEl) {
      setBoxShadowAnchorEl(null)
      return
    }
    const el = boxShadowWrapRef.current
    if (!el) return
    setBoxShadowAnchorEl(el)
    if (!hasBoxShadowConfig) {
      actions.setProp(selectedId, (props: any) => {
        delete props[BOX_SHADOW_DRAFT_KEY]
        setResponsiveStyleProp(props, "boxShadow", buildBoxShadow(DEFAULT_BOX_SHADOW), viewport)
      })
    }
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
              value={(getResponsiveStyleProp(selectedProps, "mixBlendMode", viewport) as string | undefined) ?? "normal"}
              onChange={handleBlendChange}
              options={CRAFT_MIX_BLEND_MODE_OPTIONS}
            />
          ) : null}

          <CraftSettingsPercentSliderRow
            label="Opacity"
            value={opacityStoredToUiPercent(getResponsiveStyleProp(selectedProps, "opacity", viewport))}
            onChange={handleOpacityChange}
          />

          {!isRn ? (
            <>
              <CraftSettingsButtonGroup
                label="Outline"
                value={outlineMode}
                onChange={handleOutlineModeChange}
                options={[
                  { id: "none", content: <CloseIcon size={16} fill={outlineIconFill}/> },
                  { id: "solid", content: <MinusIcon size={16} fill={outlineIconFill}/> },
                  { id: "dashed", content: <DashedIcon size={16} fill={outlineIconFill}/> },
                  { id: "dotted", content: <MoreHorizontalIcon size={16} fill={outlineIconFill}/> },
                ]}
              />

              {outlineMode !== "none" && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                  <Box sx={{ display: "flex", columnGap: "8px" }}>
                    <CraftSettingsInput
                      label="Width"
                      type="number"
                      value={getOutlineWidthUi(selectedProps, viewport)}
                      onChange={handleOutlineWidthChange}
                    />
                    <CraftSettingsInput
                      label="Offset"
                      type="number"
                      value={getOutlineOffsetUi(selectedProps, viewport)}
                      onChange={handleOutlineOffsetChange}
                    />
                  </Box>
                  <CraftSettingsColorField
                    label="Color"
                    value={getOutlineColorUi(selectedProps, viewport)}
                    onChange={handleOutlineColorChange}
                  />
                </Box>
              )}
            </>
          ) : null}

          {!isRn ? (
            <>
              <BoxShadowToolbar
                hasBoxShadowConfig={hasBoxShadowConfig}
                boxShadowParts={boxShadowParts}
                boxShadowSummaryLabel={boxShadowSummaryLabel}
                boxShadowOnCanvas={boxShadowOnCanvas}
                popperOpen={Boolean(boxShadowAnchorEl)}
                wrapRef={boxShadowWrapRef}
                onTogglePopper={toggleBoxShadowPopper}
                onToggleCanvasVisibility={handleToggleBoxShadowCanvas}
                onClear={handleClearBoxShadow}
              />

              <BoxShadowSettingsPopper
                open={Boolean(boxShadowAnchorEl)}
                anchorEl={boxShadowAnchorEl}
                popperRef={boxShadowPopperRef}
                boxShadowParts={boxShadowParts}
                onApplyPatch={applyBoxShadowPatch}
              />
            </>
          ) : null}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
