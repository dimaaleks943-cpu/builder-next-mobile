import {
  Box,
  Divider,
  Paper,
  Popper,
  Tooltip,
  Typography,
} from "@mui/material"
import debounce from "lodash/debounce"
import type { Ref } from "react"
import { useEffect, useMemo, useState } from "react"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../../../theme/colors.ts"
import { CloseIcon } from "../../../../../icons/CloseIcon.tsx"
import { MinusIcon } from "../../../../../icons/MinusIcon.tsx"
import { DashedIcon } from "../../../../../icons/DashedIcon.tsx"
import { MoreHorizontalIcon } from "../../../../../icons/MoreHorizontalIcon.tsx"
import { CraftSettingsButtonGroup } from "../../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import {
  CraftSettingsPercentSliderRow
} from "../../../components/craftSettingsControls/CraftSettingsPercentSliderRow.tsx"
import { CraftSettingsColorField } from "../../../components/craftSettingsControls/CraftSettingsColorField.tsx"
import {
  CraftSettingsResetLabelWithPopper
} from "../../../components/craftSettingsControls/CraftSettingsResetLabelWithPopper.tsx"
import type { PreviewViewport } from "../../../builder.enum.ts"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../../../responsiveStyle.ts"

const COLOR_COMMIT_DEBOUNCE_MS = 120
const RULE_WIDTH_MAX_PX = 60

const COLUMN_RULE_STYLE_IDS = new Set(["none", "solid", "dashed", "dotted"])

const clampPct = (n: number) =>
  Math.min(100, Math.max(0, Number.isNaN(n) ? 0 : n))

const parseGapPercent = (raw: unknown): number => {
  if (raw === undefined || raw === null) return 0
  const s = String(raw).trim()
  if (s === "") return 0
  const pm = s.match(/^(\d+(?:\.\d+)?)%$/i)
  if (pm) return clampPct(Number(pm[1]))
  const pxm = s.match(/^(\d+(?:\.\d+)?)px$/i)
  if (pxm) return clampPct(Math.round((Number(pxm[1]) / 40) * 100))
  return 0
}

const parseColumnRuleShorthand = (
  raw: unknown,
): { width?: string; style?: string; color?: string } => {
  if (typeof raw !== "string") return {}
  let s = raw.trim()
  if (s === "") return {}

  let color: string | undefined
  const rgb = s.match(/(rgba?\([^)]*\))\s*$/i)
  if (rgb) {
    color = rgb[1]
    s = s.slice(0, rgb.index).trim()
  } else {
    const hex = s.match(/(#[0-9a-fA-F]{3,8})\s*$/)
    if (hex) {
      color = hex[1]
      s = s.slice(0, hex.index).trim()
    }
  }

  const tokens = s.split(/\s+/).filter(Boolean)
  let width: string | undefined
  let style: string | undefined
  for (const t of tokens) {
    const low = t.toLowerCase()
    if (/^(\d+(?:\.\d+)?)(px|em|rem)$/i.test(t) || /^(thin|medium|thick)$/i.test(t)) {
      width = t
      continue
    }
    if (COLUMN_RULE_STYLE_IDS.has(low) || /^(double|hidden|groove|ridge|inset|outset)$/i.test(t)) {
      style = low
      continue
    }
    if (!width && !style) width = t
    else if (!style) style = low
  }
  return { width, style, color }
}

const parseRuleWidthPercent = (raw: unknown): number => {
  if (raw === undefined || raw === null) return 0
  const s = String(raw).trim()
  if (s === "") return 0
  const pxm = s.match(/^(\d+(?:\.\d+)?)px$/i)
  if (pxm) {
    return clampPct(Math.round((Number(pxm[1]) / RULE_WIDTH_MAX_PX) * 100))
  }
  const low = s.toLowerCase()
  if (low === "thin") return clampPct(Math.round((1 / RULE_WIDTH_MAX_PX) * 100))
  if (low === "medium") return clampPct(Math.round((3 / RULE_WIDTH_MAX_PX) * 100))
  if (low === "thick") return clampPct(Math.round((5 / RULE_WIDTH_MAX_PX) * 100))
  return 0
}

const ruleWidthPercentToPx = (pct: number) =>
  Math.max(0, Math.round((clampPct(pct) / 100) * RULE_WIDTH_MAX_PX))

interface Props {
  open: boolean;
  anchorEl: HTMLElement | null;
  popperRef: Ref<HTMLDivElement>;
  viewport: PreviewViewport;
  selectedId: string;
  selectedProps: Record<string, unknown>;
  actions: {
    setProp: (
      id: string,
      updater: (props: Record<string, unknown>) => void,
    ) => void
  };
}

//TODO проверить корректность настроек посел layout
export const TypographyColumnsSettingsPopper = ({
  open,
  anchorEl,
  popperRef,
  viewport,
  selectedId,
  selectedProps,
  actions,
}: Props) => {
  const columnCountRaw = getResponsiveStyleProp(
    selectedProps,
    "columnCount",
    viewport,
  )
  const hasColumnCount =
    columnCountRaw !== undefined &&
    columnCountRaw !== null &&
    columnCountRaw !== "" &&
    !(typeof columnCountRaw === "number" && columnCountRaw === 0)

  const columnGapRaw = getResponsiveStyleProp(
    selectedProps,
    "columnGap",
    viewport,
  )

  const parentHasExplicitColumnGap = useEditor((state) => {
    const node = state.nodes[selectedId]
    const parentId = node?.data?.parent as string | undefined | null
    if (!parentId) return false
    const parentProps = state.nodes[parentId]?.data?.props as
      | Record<string, unknown>
      | undefined
    if (!parentProps) return false
    const g = getResponsiveStyleProp(parentProps, "columnGap", viewport)
    return g !== undefined && g !== null && String(g).trim() !== ""
  })
  const columnRuleWidthRaw = getResponsiveStyleProp(
    selectedProps,
    "columnRuleWidth",
    viewport,
  )
  const columnRuleStyleRaw = getResponsiveStyleProp(
    selectedProps,
    "columnRuleStyle",
    viewport,
  )
  const columnRuleColorRaw = getResponsiveStyleProp(
    selectedProps,
    "columnRuleColor",
    viewport,
  )
  const columnRuleShorthandRaw = getResponsiveStyleProp(
    selectedProps,
    "columnRule",
    viewport,
  )

  const parsedShorthand =
    typeof columnRuleShorthandRaw === "string"
      ? parseColumnRuleShorthand(columnRuleShorthandRaw)
      : {}

  const effectiveRuleWidth =
    columnRuleWidthRaw !== undefined &&
    columnRuleWidthRaw !== null &&
    String(columnRuleWidthRaw).trim() !== ""
      ? columnRuleWidthRaw
      : parsedShorthand.width

  const effectiveRuleStyleStr =
    columnRuleStyleRaw !== undefined &&
    columnRuleStyleRaw !== null &&
    String(columnRuleStyleRaw).trim() !== ""
      ? String(columnRuleStyleRaw).trim().toLowerCase()
      : parsedShorthand.style

  const effectiveRuleColor =
    columnRuleColorRaw !== undefined &&
    columnRuleColorRaw !== null &&
    String(columnRuleColorRaw).trim() !== ""
      ? String(columnRuleColorRaw).trim()
      : parsedShorthand.color

  const ruleStyleToggleValue =
    effectiveRuleStyleStr && COLUMN_RULE_STYLE_IDS.has(effectiveRuleStyleStr)
      ? effectiveRuleStyleStr
      : undefined

  const columnSpanRaw = getResponsiveStyleProp(
    selectedProps,
    "columnSpan",
    viewport,
  )
  const columnSpanStr =
    columnSpanRaw !== undefined && columnSpanRaw !== null
      ? String(columnSpanRaw).trim()
      : ""
  const spanToggleValue =
    columnSpanStr === "none" || columnSpanStr === "all"
      ? columnSpanStr
      : undefined

  const gapPercentUi = parseGapPercent(columnGapRaw)
  const ruleWidthPercentUi = parseRuleWidthPercent(effectiveRuleWidth)

  const columnGapStr =
    columnGapRaw !== undefined && columnGapRaw !== null
      ? String(columnGapRaw).trim()
      : ""
  const hasColumnGapExplicit = columnGapStr !== ""

  const gapRowDisabled = !hasColumnCount
  const dividerControlsDisabled = !hasColumnCount || !hasColumnGapExplicit
  const spanSectionDisabled = !parentHasExplicitColumnGap

  const hasRuleWidthExplicit =
    (columnRuleWidthRaw !== undefined &&
      columnRuleWidthRaw !== null &&
      String(columnRuleWidthRaw).trim() !== "") ||
    Boolean(parsedShorthand.width)

  const hasRuleStyleExplicit =
    (columnRuleStyleRaw !== undefined &&
      columnRuleStyleRaw !== null &&
      String(columnRuleStyleRaw).trim() !== "") ||
    Boolean(parsedShorthand.style)

  const hasRuleColorExplicit =
    (columnRuleColorRaw !== undefined &&
      columnRuleColorRaw !== null &&
      String(columnRuleColorRaw).trim() !== "") ||
    Boolean(parsedShorthand.color)

  const hasColumnSpanExplicit = columnSpanStr !== ""

  const colorDraftSource = effectiveRuleColor ?? ""
  const [colorDraft, setColorDraft] = useState(colorDraftSource)

  const debouncedCommitColor = useMemo(
    () =>
      debounce((color: string) => {
        actions.setProp(selectedId, (props) => {
          setResponsiveStyleProp(props, "columnRule", undefined, viewport)
          setResponsiveStyleProp(props, "columnRuleColor", color, viewport)
        })
      }, COLOR_COMMIT_DEBOUNCE_MS),
    [actions, selectedId, viewport],
  )

  useEffect(() => () => debouncedCommitColor.cancel(), [debouncedCommitColor])

  useEffect(() => {
    if (!open) {
      debouncedCommitColor.flush()
    }
  }, [open, debouncedCommitColor])

  useEffect(() => {
    setColorDraft(colorDraftSource)
  }, [colorDraftSource])

  const clearColumnRuleShorthand = (props: Record<string, unknown>) => {
    setResponsiveStyleProp(props, "columnRule", undefined, viewport)
  }

  const patchColumnRuleShorthand = (
    props: Record<string, unknown>,
    strip: { width?: boolean; style?: boolean; color?: boolean },
  ) => {
    const raw = getResponsiveStyleProp(props, "columnRule", viewport)
    if (typeof raw !== "string" || raw.trim() === "") return
    const p = parseColumnRuleShorthand(raw)
    const width = strip.width ? undefined : p.width
    const style = strip.style ? undefined : p.style
    const color = strip.color ? undefined : p.color
    const parts = [width, style, color].filter(Boolean) as string[]
    const next = parts.join(" ")
    if (next === "") {
      setResponsiveStyleProp(props, "columnRule", undefined, viewport)
      return
    }
    setResponsiveStyleProp(props, "columnRule", next, viewport)
  }

  const handleGapChange = (pct: number) => {
    if (!hasColumnCount) return
    actions.setProp(selectedId, (props) => {
      const v = clampPct(pct)
      setResponsiveStyleProp(
        props,
        "columnGap",
        v === 0 ? undefined : `${v}%`,
        viewport,
      )
    })
  }

  const resetColumnGap = () => {
    actions.setProp(selectedId, (props) => {
      setResponsiveStyleProp(props, "columnGap", undefined, viewport)
    })
  }

  const handleRuleStyleChange = (id: string) => {
    if (dividerControlsDisabled) return
    actions.setProp(selectedId, (props) => {
      clearColumnRuleShorthand(props)
      setResponsiveStyleProp(props, "columnRuleStyle", id, viewport)
    })
  }

  const resetRuleStyle = () => {
    actions.setProp(selectedId, (props) => {
      setResponsiveStyleProp(props, "columnRuleStyle", undefined, viewport)
      patchColumnRuleShorthand(props, { style: true })
    })
  }

  const handleRuleWidthChange = (pct: number) => {
    if (dividerControlsDisabled) return
    actions.setProp(selectedId, (props) => {
      clearColumnRuleShorthand(props)
      const px = ruleWidthPercentToPx(pct)
      setResponsiveStyleProp(
        props,
        "columnRuleWidth",
        px === 0 ? undefined : `${px}px`,
        viewport,
      )
    })
  }

  const resetRuleWidth = () => {
    actions.setProp(selectedId, (props) => {
      setResponsiveStyleProp(props, "columnRuleWidth", undefined, viewport)
      patchColumnRuleShorthand(props, { width: true })
    })
  }

  const handleRuleColorChange = (value: string) => {
    if (dividerControlsDisabled) return
    setColorDraft(value)
    debouncedCommitColor(value)
  }

  const resetRuleColor = () => {
    debouncedCommitColor.cancel()
    setColorDraft("")
    actions.setProp(selectedId, (props) => {
      setResponsiveStyleProp(props, "columnRuleColor", undefined, viewport)
      patchColumnRuleShorthand(props, { color: true })
    })
  }

  const handleSpanChange = (id: string) => {
    if (spanSectionDisabled) return
    actions.setProp(selectedId, (props) => {
      setResponsiveStyleProp(props, "columnSpan", id, viewport)
    })
  }

  const resetSpan = () => {
    actions.setProp(selectedId, (props) => {
      setResponsiveStyleProp(props, "columnSpan", undefined, viewport)
    })
  }

  const iconFill = COLORS.purple400

  const paperPaddingPx = 8

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
      style={{ zIndex: 4000 }}
    >
      <Paper
        ref={popperRef}
        elevation={3}
        sx={{
          width: "288px",
          maxWidth: "min(288px, calc(100vw - 24px))",
          border: `1px solid ${COLORS.purple100}`,
          borderRadius: "8px",
          padding: `${paperPaddingPx}px`,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          boxSizing: "border-box",
          overflow: "visible",
        }}
      >

        <Tooltip
          title={
            gapRowDisabled
              ? "Чтобы задать расстояние между колонками, сначала укажите число колонок (Columns)."
              : ""
          }
          disableHoverListener={!gapRowDisabled}
          disableFocusListener={!gapRowDisabled}
          disableTouchListener={!gapRowDisabled}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              ...(gapRowDisabled ? { opacity: 0.55, pointerEvents: "none" } : {}),
            }}
          >
            <CraftSettingsResetLabelWithPopper
              kind="labelReset"
              label="Gap"
              variant="fixed"
              disableResetPopperPortal
              labelReset={{
                hasValue: hasColumnGapExplicit,
                onReset: resetColumnGap,
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <CraftSettingsPercentSliderRow
                hideLabel
                label="Gap"
                value={gapPercentUi}
                onChange={handleGapChange}
              />
            </Box>
          </Box>
        </Tooltip>

        <Divider
          sx={{
            borderColor: COLORS.purple100,
            marginLeft: `-${paperPaddingPx}px`,
            marginRight: `-${paperPaddingPx}px`,
            width: `calc(100% + ${paperPaddingPx * 2}px)`,
          }}
        />

        <Tooltip
          title={
            dividerControlsDisabled
              ? !hasColumnCount
                ? "Сначала укажите число колонок (Columns)."
                : "Сначала задайте column-gap (ползунок Gap)."
              : ""
          }
          disableHoverListener={!dividerControlsDisabled}
          disableFocusListener={!dividerControlsDisabled}
          disableTouchListener={!dividerControlsDisabled}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              ...(dividerControlsDisabled
                ? { opacity: 0.55, pointerEvents: "none" }
                : {}),
            }}
          >
            <Typography
              sx={{
                fontSize: "10px",
                lineHeight: "14px",
                fontWeight: 500,
                color: COLORS.black,
              }}
            >
              Настройки разделителя
            </Typography>

            <CraftSettingsButtonGroup
              label="Style"
              value={ruleStyleToggleValue}
              resetLabelActive={hasRuleStyleExplicit}
              disableResetPopperPortal
              options={[
                { id: "none", content: <CloseIcon size={14} fill={iconFill}/> },
                {
                  id: "solid",
                  content: (
                    <Box sx={{ display: "flex", transform: "rotate(90deg) scaleY(-1)" }}>
                      <MinusIcon size={14} fill={iconFill}/>
                    </Box>
                  ),
                },
                {
                  id: "dashed",
                  content: (
                    <Box sx={{ display: "flex", transform: "rotate(90deg) scaleY(-1)" }}>
                      <DashedIcon size={14} fill={iconFill}/>
                    </Box>
                  ),
                },
                {
                  id: "dotted",
                  content: (
                    <Box sx={{ display: "flex", transform: "rotate(90deg) scaleY(-1)" }}>
                      <MoreHorizontalIcon size={14} fill={iconFill}/>
                    </Box>
                  ),
                },
              ]}
              onChange={handleRuleStyleChange}
              onReset={resetRuleStyle}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
              }}
            >
              <CraftSettingsResetLabelWithPopper
                kind="labelReset"
                label="Width"
                variant="fixed"
                disableResetPopperPortal
                labelReset={{
                  hasValue: hasRuleWidthExplicit,
                  onReset: resetRuleWidth,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <CraftSettingsPercentSliderRow
                  hideLabel
                  label="Width"
                  value={ruleWidthPercentUi}
                  onChange={handleRuleWidthChange}
                />
              </Box>
            </Box>

            <CraftSettingsColorField
              label="Color"
              value={colorDraft}
              onChange={handleRuleColorChange}
              disabled={dividerControlsDisabled}
              disableResetPopperPortal
              labelReset={{
                hasValue: hasRuleColorExplicit,
                onReset: resetRuleColor,
              }}
            />
          </Box>
        </Tooltip>

        <Divider
          sx={{
            borderColor: COLORS.purple100,
            marginLeft: `-${paperPaddingPx}px`,
            marginRight: `-${paperPaddingPx}px`,
            width: `calc(100% + ${paperPaddingPx * 2}px)`,
          }}
        />

        <Typography
          sx={{
            fontSize: "10px",
            lineHeight: "14px",
            fontWeight: 500,
            color: COLORS.black,
          }}
        >
          Настройки колонки
        </Typography>

        <Tooltip
          title={
            spanSectionDisabled
              ? "У родительского контейнера должен быть задан column-gap."
              : ""
          }
          disableHoverListener={!spanSectionDisabled}
          disableFocusListener={!spanSectionDisabled}
          disableTouchListener={!spanSectionDisabled}
        >
          <Box
            sx={{
              ...(spanSectionDisabled
                ? { opacity: 0.55, pointerEvents: "none" }
                : {}),
            }}
          >
            <CraftSettingsButtonGroup
              label="Span"
              value={spanToggleValue}
              resetLabelActive={hasColumnSpanExplicit}
              disableResetPopperPortal
              options={[
                { id: "none", content: "Don't" },
                { id: "all", content: "Do" },
              ]}
              onChange={handleSpanChange}
              onReset={resetSpan}
            />
          </Box>
        </Tooltip>
      </Paper>
    </Popper>
  )
}
