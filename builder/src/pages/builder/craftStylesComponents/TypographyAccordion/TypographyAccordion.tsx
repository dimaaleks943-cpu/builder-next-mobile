import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material"
import type {
  ChangeEvent,
  KeyboardEvent,
} from "react"
import { useEffect, useRef, useState } from "react"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../../theme/colors.ts"
import {
  FONT_SIZE_UNIT_MENU,
  parseSizeProp,
  type CraftSizeMenuToken,
} from "../../../../utils/craftCssSizeProp.ts"
import { AlignCenterIcon } from "../../../../icons/AlignCenterIcon.tsx"
import { AlignJustifyIcon } from "../../../../icons/AlignJustifyIcon.tsx"
import { AlignLeftIcon } from "../../../../icons/AlignLeftIcon.tsx"
import { CraftSettingsSelect } from "../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { CraftSettingsInput } from "../../components/craftSettingsControls/CraftSettingsInput.tsx"
import { CraftSettingsValueWithUnit } from "../../components/craftSettingsControls/CraftSettingsValueWithUnit.tsx"
import { CraftSettingsButtonGroup } from "../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsColorField } from "../../components/craftSettingsControls/CraftSettingsColorField.tsx"
import {
  TypographyFormatRow,
  type TextDecorationKind,
} from "./components/TypographyFormatRow.tsx"
import { TypographyDecorationSettingsPopper } from "./components/TypographyDecorationSettingsPopper.tsx"
import { TypographyColumnsSettingsPopper } from "./components/TypographyColumnsSettingsPopper.tsx"
import {
  buildTextDecorationAdvanced,
  parseTextDecorationAdvanced,
  type TextDecorationAdvancedParts,
} from "./textDecorationAdvanced.ts"
import { TypographyBreakingRow } from "./components/TypographyBreakingRow.tsx"
import { TypographyWrapTruncateSection } from "./components/TypographyWrapTruncateSection.tsx"
import { usePreviewViewport } from "../../context/PreviewViewportContext.tsx"
import {
  getResponsiveStyleProp,
  resolveResponsiveStyle,
  setResponsiveStyleProp,
  type ResponsiveStyle,
} from "../../responsiveStyle.ts"
import { ChevronDownIcon } from "../../../../icons/ChevronDownIcon.tsx"
import { CloseIcon } from "../../../../icons/CloseIcon.tsx"
import { MoreHorizontalIcon } from "../../../../icons/MoreHorizontalIcon.tsx"
import { BottomResetLabel } from "./components/BottomResetLabel.tsx"

interface SelectedTypographyProps {
  fontFamily?: string;
  fontSize?: number | string;
  lineHeight?: number | string;
  fontWeight?: "normal" | "bold";
  textAlign?: "left" | "center" | "right" | "justify";
  color?: string;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  strokeColor?: string;
  strokeWidth?: number;
  style?: ResponsiveStyle;
  textDecoration?: string;
  textDecorationSkipInk?: string;
  fontStyle?: string;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
}

const TEXT_ALIGN_ICON_SIZE = 14

const LETTER_SPACING_UNIT_MENU: readonly CraftSizeMenuToken[] = ["px", "em", "rem"]

const parseTextIndentDraftFromProp = (value: unknown): string => {
  if (value === undefined || value === null) return ""
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value === 0) return ""
    return String(value)
  }
  if (typeof value === "string") {
    const t = value.trim()
    if (t === "") return ""
    const pxMatch = t.match(/^(-?(?:\d+\.?\d*|\.\d+))px$/i)
    if (pxMatch) {
      const n = Number(pxMatch[1])
      return Number.isFinite(n) && n !== 0 ? pxMatch[1] : ""
    }
    const n = Number(t)
    return Number.isFinite(n) && n !== 0 ? String(n) : ""
  }
  return ""
}

const parseDecorationFromResolved = (resolved: Record<string, unknown>): TextDecorationKind | undefined => {
  const td = resolved.textDecoration
  if (typeof td === "string") {
    if (td.includes("line-through")) return "line-through"
    if (td.includes("underline")) return "underline"
    if (td.includes("overline")) return "overline"
  }
  if (resolved.isStrikethrough) return "line-through"
  if (resolved.isUnderline) return "underline"
  return undefined
}

const parseItalicFromResolved = (resolved: Record<string, unknown>): boolean => {
  const fs = resolved.fontStyle
  if (fs === "italic") return true
  return Boolean(resolved.isItalic)
}

interface EditorSelection {
  selectedId: string | null;
  selectedProps: SelectedTypographyProps | null;
}

const renderTextAlignIcon = (
  id: "left" | "center" | "right" | "justify",
  fill: string,
) => {
  switch (id) {
    case "left":
      return <AlignLeftIcon size={TEXT_ALIGN_ICON_SIZE} fill={fill}/>
    case "center":
      return <AlignCenterIcon size={TEXT_ALIGN_ICON_SIZE} fill={fill}/>
    case "right":
      return (
        <Box sx={{ display: "inline-flex", transform: "scaleX(-1)" }}>
          <AlignLeftIcon size={TEXT_ALIGN_ICON_SIZE} fill={fill}/>
        </Box>
      )
    case "justify":
      return <AlignJustifyIcon size={TEXT_ALIGN_ICON_SIZE} fill={fill}/>
  }
}

export const TypographyAccordion = () => {
  const { actions } = useEditor()
  const viewport = usePreviewViewport()
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
  const [moreTypeOptionsOpen, setMoreTypeOptionsOpen] = useState(false)
  const [textIndentDraft, setTextIndentDraft] = useState("")
  const decorationSettingsWrapRef = useRef<HTMLDivElement>(null)
  const decorationSettingsPopperRef = useRef<HTMLDivElement>(null)
  const [decorationSettingsAnchorEl, setDecorationSettingsAnchorEl] = useState<HTMLElement | null>(null)
  const columnsSettingsWrapRef = useRef<HTMLDivElement>(null)
  const columnsSettingsPopperRef = useRef<HTMLDivElement>(null)
  const [columnsSettingsAnchorEl, setColumnsSettingsAnchorEl] =
    useState<HTMLElement | null>(null)

  const colorTimeoutRef = useRef<number | undefined>(undefined)
  const strokeColorTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    setColorDraft(
      (getResponsiveStyleProp(selectedProps as unknown as Record<string, unknown>, "color", viewport) as string | undefined) ??
      COLORS.black,
    )
  }, [selectedProps, selectedId, viewport])

  useEffect(() => {
    setStrokeColorDraft(
      (getResponsiveStyleProp(selectedProps as unknown as Record<string, unknown>, "strokeColor", viewport) as string | undefined) ??
      COLORS.black,
    )
  }, [selectedProps, selectedId, viewport])

  useEffect(() => {
    setTextIndentDraft(
      parseTextIndentDraftFromProp(
        getResponsiveStyleProp(
          selectedProps as unknown as Record<string, unknown>,
          "textIndent",
          viewport,
        ),
      ),
    )
  }, [selectedProps, selectedId, viewport])

  useEffect(() => {
    if (!moreTypeOptionsOpen) {
      setColumnsSettingsAnchorEl(null)
    }
  }, [moreTypeOptionsOpen])

  useEffect(() => {
    if (!decorationSettingsAnchorEl && !columnsSettingsAnchorEl) return
    const onDocMouseDown = (event: MouseEvent) => {
      const target = event.target as Node
      const inDecoration =
        decorationSettingsWrapRef.current?.contains(target) ||
        decorationSettingsPopperRef.current?.contains(target)
      const inColumns =
        columnsSettingsWrapRef.current?.contains(target) ||
        columnsSettingsPopperRef.current?.contains(target)
      if (inDecoration || inColumns) return
      setDecorationSettingsAnchorEl(null)
      setColumnsSettingsAnchorEl(null)
    }
    document.addEventListener("mousedown", onDocMouseDown, true)

    return () => document.removeEventListener("mousedown", onDocMouseDown, true)
  }, [decorationSettingsAnchorEl, columnsSettingsAnchorEl])

  const scheduleColorUpdate = (value: string) => {
    if (!selectedId) return
    if (colorTimeoutRef.current !== undefined) {
      window.clearTimeout(colorTimeoutRef.current)
    }
    colorTimeoutRef.current = window.setTimeout(() => {
      actions.setProp(selectedId, (props: any) => {
        setResponsiveStyleProp(props, "color", value, viewport)
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
        setResponsiveStyleProp(props, "strokeColor", value, viewport)
      })
    }, 200)
  }

  const handleFontFamilyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(
        props,
        "fontFamily",
        value === "system" ? undefined : value,
        viewport,
      )
    })
  }

  const handleFontWeightChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value === "bold" ? "bold" : "normal"
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "fontWeight", value, viewport)
    })
  }

  const handleFontSizeCommit = (next: string | number | undefined) => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "fontSize", next, viewport)
    })
  }

  const handleLineHeightCommit = (next: string | number | undefined) => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "lineHeight", next, viewport)
    })
  }

  const handleColorChange = (value: string) => {
    setColorDraft(value)
    scheduleColorUpdate(value)
  }

  const handleAlignChange = (align: "left" | "center" | "right" | "justify") => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "textAlign", align, viewport)
    })
  }

  const handleAlignReset = () => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "textAlign", undefined, viewport)
    })
  }

  const handleCapitalizeChange = (
    transform: "none" | "uppercase" | "lowercase" | "capitalize",
  ) => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "textTransform", transform, viewport)
    })
  }

  const handleStrokeWidthChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? 0 : next
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "strokeWidth", safe, viewport)
    })
  }

  const handleStrokeColorChange = (value: string) => {
    setStrokeColorDraft(value)
    scheduleStrokeColorUpdate(value)
  }

  const resetStrokeWidth = () => {
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "strokeWidth", undefined, viewport)
    })
  }

  const resetStrokeColor = () => {
    if (strokeColorTimeoutRef.current !== undefined) {
      window.clearTimeout(strokeColorTimeoutRef.current)
      strokeColorTimeoutRef.current = undefined
    }
    setStrokeColorDraft(COLORS.black)
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "strokeColor", undefined, viewport)
    })
  }

  const textAlignProp = getResponsiveStyleProp(
    selectedProps as unknown as Record<string, unknown>,
    "textAlign",
    viewport,
  ) as string | undefined

  const resolvedForFormat = resolveResponsiveStyle(
    selectedProps.style,
    viewport,
  ) as Record<string, unknown>
  const formatDecoration = parseDecorationFromResolved(resolvedForFormat)
  const formatItalic = parseItalicFromResolved(resolvedForFormat)

  const decorationTdRaw = getResponsiveStyleProp(
    selectedProps as unknown as Record<string, unknown>,
    "textDecoration",
    viewport,
  ) as string | undefined
  const decorationTdParts = parseTextDecorationAdvanced(decorationTdRaw)
  const decorationSkipInkRaw = getResponsiveStyleProp(
    selectedProps as unknown as Record<string, unknown>,
    "textDecorationSkipInk",
    viewport,
  )
  const decorationSkipInk =
    typeof decorationSkipInkRaw === "string" ? decorationSkipInkRaw : undefined

  const isGridDisplay = resolvedForFormat.display === "grid"

  const letterSpacingProp = getResponsiveStyleProp(
    selectedProps as unknown as Record<string, unknown>,
    "letterSpacing",
    viewport,
  )

  const textIndentProp = getResponsiveStyleProp(
    selectedProps as unknown as Record<string, unknown>,
    "textIndent",
    viewport,
  )

  const columnCountProp = getResponsiveStyleProp(
    selectedProps as unknown as Record<string, unknown>,
    "columnCount",
    viewport,
  )

  const hasLetterSpacingValue =
    letterSpacingProp !== undefined &&
    letterSpacingProp !== null &&
    String(letterSpacingProp).trim() !== ""

  const hasTextIndentValue =
    parseTextIndentDraftFromProp(textIndentProp) !== ""

  const hasColumnCountValue =
    columnCountProp !== undefined &&
    columnCountProp !== null &&
    columnCountProp !== "" &&
    !(typeof columnCountProp === "number" && columnCountProp === 0)

  const responsiveStrokeWidth = getResponsiveStyleProp(
    selectedProps as unknown as Record<string, unknown>,
    "strokeWidth",
    viewport,
  ) as number | undefined

  const hasStrokeWidthResetValue =
    responsiveStrokeWidth !== undefined &&
    responsiveStrokeWidth !== null &&
    Number(responsiveStrokeWidth) !== 0

  const responsiveStrokeColor = getResponsiveStyleProp(
    selectedProps as unknown as Record<string, unknown>,
    "strokeColor",
    viewport,
  ) as string | undefined

  const hasStrokeColorResetValue =
    responsiveStrokeColor !== undefined &&
    responsiveStrokeColor !== null &&
    String(responsiveStrokeColor).trim() !== ""

  const handleLetterSpacingCommit = (
    next: string | number | undefined,
  ) => {
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      if (next === undefined || next === null || next === "") {
        setResponsiveStyleProp(props, "letterSpacing", undefined, viewport)
        return
      }
      if (typeof next === "number") {
        setResponsiveStyleProp(
          props,
          "letterSpacing",
          next === 0 ? undefined : `${next}px`,
          viewport,
        )
        return
      }
      const parsed = parseSizeProp(next)
      if (parsed.kind === "length" && Number(parsed.n) === 0) {
        setResponsiveStyleProp(props, "letterSpacing", undefined, viewport)
        return
      }
      setResponsiveStyleProp(props, "letterSpacing", next, viewport)
    })
  }

  const resetLetterSpacing = () => {
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "letterSpacing", undefined, viewport)
    })
  }

  const handleTextIndentDraftChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    let next = event.target.value.replace(/[^\d.]/g, "")
    const dot = next.indexOf(".")
    if (dot !== -1) {
      next =
        next.slice(0, dot + 1) + next.slice(dot + 1).replace(/\./g, "")
    }
    setTextIndentDraft(next)
  }

  const commitTextIndentDraft = () => {
    const t = textIndentDraft.trim()
    if (t === "") {
      actions.setProp(selectedId, (props: Record<string, unknown>) => {
        setResponsiveStyleProp(props, "textIndent", undefined, viewport)
      })
      return
    }
    const n = Number(t)
    if (!Number.isFinite(n) || n === 0) {
      actions.setProp(selectedId, (props: Record<string, unknown>) => {
        setResponsiveStyleProp(props, "textIndent", undefined, viewport)
      })
      return
    }
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "textIndent", `${n}px`, viewport)
    })
  }

  const resetTextIndent = () => {
    setTextIndentDraft("")
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "textIndent", undefined, viewport)
    })
  }

  const handleTextIndentKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  const handleColumnCountCommit = (
    next: string | number | undefined,
  ) => {
    if (!isGridDisplay) return
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      if (next === undefined || next === null || next === "") {
        setResponsiveStyleProp(props, "columnCount", undefined, viewport)
        return
      }
      if (typeof next === "string" && /^auto$/i.test(next.trim())) {
        setResponsiveStyleProp(props, "columnCount", undefined, viewport)
        return
      }
      const n = typeof next === "number" ? next : Number(next)
      if (!Number.isFinite(n) || n <= 0) {
        setResponsiveStyleProp(props, "columnCount", undefined, viewport)
        return
      }
      const k = Math.trunc(n)
      if (k <= 0) {
        setResponsiveStyleProp(props, "columnCount", undefined, viewport)
        return
      }
      setResponsiveStyleProp(props, "columnCount", k, viewport)
    })
  }

  const resetColumnCount = () => {
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "columnCount", undefined, viewport)
    })
  }

  const handleFormatClear = () => {
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "isItalic", undefined, viewport)
      setResponsiveStyleProp(props, "isUnderline", undefined, viewport)
      setResponsiveStyleProp(props, "isStrikethrough", undefined, viewport)
      setResponsiveStyleProp(props, "textDecoration", undefined, viewport)
      setResponsiveStyleProp(props, "textDecorationSkipInk", undefined, viewport)
      setResponsiveStyleProp(props, "fontStyle", undefined, viewport)
    })
  }

  const handleFormatDecorationPress = (kind: TextDecorationKind) => {
    const next = formatDecoration === kind ? undefined : kind
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "isUnderline", undefined, viewport)
      setResponsiveStyleProp(props, "isStrikethrough", undefined, viewport)
      setResponsiveStyleProp(props, "textDecoration", next, viewport)
    })
  }

  const handleFormatItalicPress = () => {
    const nextItalic = !formatItalic
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "isItalic", undefined, viewport)
      setResponsiveStyleProp(
        props,
        "fontStyle",
        nextItalic ? "italic" : undefined,
        viewport,
      )
    })
  }

  const toggleDecorationSettingsPopper = () => {
    if (decorationSettingsAnchorEl) {
      setDecorationSettingsAnchorEl(null)
      return
    }
    const el = decorationSettingsWrapRef.current
    if (!el) return
    setDecorationSettingsAnchorEl(el)
  }

  const toggleColumnsSettingsPopper = () => {
    if (columnsSettingsAnchorEl) {
      setColumnsSettingsAnchorEl(null)
      return
    }
    const el = columnsSettingsWrapRef.current
    if (!el) return
    setColumnsSettingsAnchorEl(el)
  }

  const applyDecorationPartsPatch = (
    patch: Partial<TextDecorationAdvancedParts>,
  ) => {
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      const curRaw = getResponsiveStyleProp(
        props,
        "textDecoration",
        viewport,
      ) as string | undefined
      const merged = { ...parseTextDecorationAdvanced(curRaw), ...patch }
      const built = buildTextDecorationAdvanced(merged)
      setResponsiveStyleProp(props, "textDecoration", built, viewport)
    })
  }

  const applyTextDecorationSkipInk = (next: string | undefined) => {
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "textDecorationSkipInk", next, viewport)
    })
  }

  return (
    <Accordion disableGutters>
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

        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <CraftSettingsSelect
            label="Font"
            value={(getResponsiveStyleProp(selectedProps as unknown as Record<string, unknown>, "fontFamily", viewport) as string | undefined) ?? "system"}
            onChange={handleFontFamilyChange}
            options={[
              { id: "system", value: "System" },
              { id: "Roboto", value: "Roboto" },
              { id: "Inter", value: "Inter" },
            ]}
          />

          <CraftSettingsSelect
            label="Weight"
            value={(getResponsiveStyleProp(selectedProps as unknown as Record<string, unknown>, "fontWeight", viewport) as string | undefined) ?? "normal"}
            onChange={handleFontWeightChange}
            options={[
              { id: "normal", value: "400 - Normal" },
              { id: "bold", value: "700 - Bold" },
            ]}
          />

          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              columnGap: "8px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Typography sx={{ flex: 1, fontSize: "10px", lineHeight: "14px", color: COLORS.gray700 }}>
              Size
            </Typography>
            <Box
              sx={{
                flex: 4,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                columnGap: "8px",
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <CraftSettingsValueWithUnit
                  label="Size"
                  withoutLabel
                  unitAffixVariant="mutedLowercase"
                  value={getResponsiveStyleProp(
                    selectedProps as unknown as Record<string, unknown>,
                    "fontSize",
                    viewport,
                  )}
                  onCommit={handleFontSizeCommit}
                  allowedUnits={FONT_SIZE_UNIT_MENU}
                  placeholder=""
                  inputWidth="100%"
                  customWidth="100%"
                />
              </Box>
              <Typography sx={{ flexShrink: 0, fontSize: "10px", lineHeight: "14px", color: COLORS.gray700 }}>
                Height
              </Typography>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <CraftSettingsValueWithUnit
                  label="Height"
                  withoutLabel
                  unitAffixVariant="mutedLowercase"
                  value={getResponsiveStyleProp(
                    selectedProps as unknown as Record<string, unknown>,
                    "lineHeight",
                    viewport,
                  )}
                  onCommit={handleLineHeightCommit}
                  allowedUnits={FONT_SIZE_UNIT_MENU}
                  placeholder=""
                  inputWidth="100%"
                  customWidth="100%"
                />
              </Box>
            </Box>
          </Box>

          <CraftSettingsColorField
            label="Color"
            value={colorDraft}
            onChange={handleColorChange}
          />

          <CraftSettingsButtonGroup
            label="Align"
            value={textAlignProp}
            onChange={(id) =>
              handleAlignChange(
                id as "left" | "center" | "right" | "justify",
              )
            }
            onReset={handleAlignReset}
            options={(
              ["left", "center", "right", "justify"] as const
            ).map((id) => {
              const fill = COLORS.purple400
              const isActive = id === textAlignProp
              return {
                id,
                content: (
                  <Box
                    sx={{
                      display: "inline-flex",
                      opacity: isActive ? 1 : 0.85,
                    }}
                  >
                    {renderTextAlignIcon(id, fill)}
                  </Box>
                ),
              }
            })}
          />

          <TypographyFormatRow
            decoration={formatDecoration}
            isItalic={formatItalic}
            onClear={handleFormatClear}
            onDecorationPress={handleFormatDecorationPress}
            onItalicPress={handleFormatItalicPress}
            decorationSettingsWrapRef={decorationSettingsWrapRef}
            onToggleDecorationSettingsPopper={toggleDecorationSettingsPopper}
          />

          <TypographyDecorationSettingsPopper
            open={Boolean(decorationSettingsAnchorEl)}
            anchorEl={decorationSettingsAnchorEl}
            popperRef={decorationSettingsPopperRef}
            parts={decorationTdParts}
            textDecorationSkipInk={decorationSkipInk}
            onClose={() => setDecorationSettingsAnchorEl(null)}
            onApplyPartsPatch={applyDecorationPartsPatch}
            onApplySkipInk={applyTextDecorationSkipInk}
          />

          <TypographyColumnsSettingsPopper
            open={Boolean(columnsSettingsAnchorEl)}
            anchorEl={columnsSettingsAnchorEl}
            popperRef={columnsSettingsPopperRef}
            viewport={viewport}
            selectedId={selectedId}
            selectedProps={selectedProps as unknown as Record<string, unknown>}
            actions={actions}
          />

          <Button
            type="button"
            variant="outlined"
            disableElevation
            onClick={() => setMoreTypeOptionsOpen((open) => !open)}
            sx={{
              alignSelf: "stretch",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              padding: "4px",
              minHeight: 0,
              borderRadius: "2px",
              border: `1px solid ${COLORS.purple100}`,
              backgroundColor: COLORS.white,
              color: COLORS.gray700,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: COLORS.white,
                border: `1px solid ${COLORS.purple100}`,
                boxShadow: "none",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                transform: moreTypeOptionsOpen ? "rotate(180deg)" : "none",
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
              More type options
            </Typography>
          </Button>

          {moreTypeOptionsOpen ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "6px",
                  alignItems: "flex-start",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "2px",
                    alignItems: "center",
                  }}
                >
                  <CraftSettingsValueWithUnit
                    label="Letter spacing"
                    value={letterSpacingProp}
                    onCommit={handleLetterSpacingCommit}
                    allowedUnits={LETTER_SPACING_UNIT_MENU}
                    withoutLabel
                    inputWidth="100%"
                    customWidth="100%"
                    placeholder="Normal"
                  />
                  <BottomResetLabel
                    hasValue={hasLetterSpacingValue}
                    onReset={resetLetterSpacing}
                  >
                    Letter spacing
                  </BottomResetLabel>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "2px",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      boxSizing: "border-box",
                      borderRadius: "4px",
                      border: `1px solid ${COLORS.purple100}`,
                      backgroundColor: COLORS.white,
                      paddingLeft: "4px",
                      paddingRight: "4px",
                      "&:focus-within": {
                        borderColor: COLORS.purple400,
                      },
                    }}
                  >
                    <Box
                      component="input"
                      type="text"
                      inputMode="decimal"
                      value={textIndentDraft}
                      onChange={handleTextIndentDraftChange}
                      onBlur={commitTextIndentDraft}
                      onKeyDown={handleTextIndentKeyDown}
                      autoComplete="off"
                      aria-label="Text indent"
                      sx={{
                        border: "none",
                        outline: "none",
                        backgroundColor: "transparent",
                        padding: "6px 0",
                        fontSize: "12px",
                        lineHeight: "14px",
                        color: "inherit",
                        width: "100%",
                        minWidth: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        flexShrink: 0,
                        fontSize: "10px",
                        lineHeight: "14px",
                        fontWeight: 600,
                        color: COLORS.gray700,
                      }}
                    >
                      px
                    </Typography>
                  </Box>
                  <BottomResetLabel
                    hasValue={hasTextIndentValue}
                    onReset={resetTextIndent}
                  >
                    Text indent
                  </BottomResetLabel>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "2px",
                    alignItems: "center",
                  }}
                >
                  <Tooltip
                    title={
                      isGridDisplay
                        ? ""
                        : "Доступно только при display: grid" //TODO проверить после починик layout
                    }
                    disableHoverListener={isGridDisplay}
                    disableFocusListener={isGridDisplay}
                    disableTouchListener={isGridDisplay}
                  >
                    <Box sx={{ width: "100%" }}>
                      <CraftSettingsValueWithUnit
                        label="Columns"
                        value={columnCountProp}
                        onCommit={handleColumnCountCommit}
                        withoutLabel
                        unitless
                        inputWidth="100%"
                        customWidth="100%"
                        placeholder="Auto"
                        disabled={!isGridDisplay}
                      />
                    </Box>
                  </Tooltip>
                  <BottomResetLabel
                    hasValue={hasColumnCountValue}
                    onReset={resetColumnCount}
                  >
                    Columns
                  </BottomResetLabel>
                </Box>

                <Box ref={columnsSettingsWrapRef}>
                  <IconButton
                    disableRipple
                    size="small"
                    aria-label="More columns options"
                    onClick={toggleColumnsSettingsPopper}
                    sx={{
                      flexShrink: 0,
                      padding: "4px",
                      color: COLORS.gray700,
                      "&:hover": {
                        backgroundColor: COLORS.secondaryVeryLightGray,
                      },
                    }}
                  >
                    <MoreHorizontalIcon size={14} fill={COLORS.gray700}/>
                  </IconButton>
                </Box>
              </Box>

              <CraftSettingsButtonGroup
                label="Capitalize"
                value={(getResponsiveStyleProp(selectedProps as unknown as Record<string, unknown>, "textTransform", viewport) as string | undefined) ?? "none"}
                options={[
                  { id: "none", content: <CloseIcon size={16}/> },
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

              <TypographyBreakingRow
                actions={actions}
                selectedId={selectedId}
                selectedProps={selectedProps as unknown as Record<string, unknown>}
                viewport={viewport}
              />

              <TypographyWrapTruncateSection
                actions={actions}
                selectedId={selectedId}
                selectedProps={selectedProps as unknown as Record<string, unknown>}
                viewport={viewport}
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr 1fr",
                  gridTemplateRows: "auto auto",
                  columnGap: "8px",
                  rowGap: "2px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <Typography
                  sx={{
                    gridRow: "1 / -1",
                    alignSelf: "center",
                    fontSize: "10px",
                    lineHeight: "14px",
                    color: COLORS.gray700,
                  }}
                >
                  Stroke
                </Typography>

                <Box
                  sx={{
                    gridColumn: 2,
                    gridRow: 1,
                    minWidth: 0,
                    width: "100%",
                  }}
                >
                  <CraftSettingsInput
                    hideLabel
                    label="Stroke width"
                    type="number"
                    min={0}
                    suffix="px"
                    value={responsiveStrokeWidth ?? 0}
                    onChange={handleStrokeWidthChange}
                    customStyles={{ flex: "none", width: "100%" }}
                  />
                </Box>

                <Box
                  sx={{
                    gridColumn: 3,
                    gridRow: 1,
                    minWidth: 0,
                    width: "100%",
                  }}
                >
                  <CraftSettingsColorField
                    hideLabel
                    label="Stroke color"
                    value={strokeColorDraft}
                    onChange={handleStrokeColorChange}
                  />
                </Box>

                <Box
                  sx={{
                    gridColumn: 2,
                    gridRow: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    rowGap: "2px",
                  }}
                >
                  <BottomResetLabel
                    variant="caption"
                    hasValue={hasStrokeWidthResetValue}
                    onReset={resetStrokeWidth}
                  >
                    Width
                  </BottomResetLabel>
                </Box>
                <Box
                  sx={{
                    gridColumn: 3,
                    gridRow: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    rowGap: "2px",
                  }}
                >
                  <BottomResetLabel
                    variant="caption"
                    hasValue={hasStrokeColorResetValue}
                    onReset={resetStrokeColor}
                  >
                    Color
                  </BottomResetLabel>
                </Box>
              </Box>
            </Box>
          ) : null}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

