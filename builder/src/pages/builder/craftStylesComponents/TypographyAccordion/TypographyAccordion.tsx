import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material"
import type { ChangeEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../../theme/colors.ts"
import {
  FONT_SIZE_UNIT_MENU,
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
import { usePreviewViewport } from "../../context/PreviewViewportContext.tsx"
import {
  getResponsiveStyleProp,
  resolveResponsiveStyle,
  setResponsiveStyleProp,
  type ResponsiveStyle,
} from "../../responsiveStyle.ts"

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
  fontStyle?: string;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
}

const TEXT_ALIGN_ICON_SIZE = 14

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
      return <AlignLeftIcon size={TEXT_ALIGN_ICON_SIZE} fill={fill} />
    case "center":
      return <AlignCenterIcon size={TEXT_ALIGN_ICON_SIZE} fill={fill} />
    case "right":
      return (
        <Box sx={{ display: "inline-flex", transform: "scaleX(-1)" }}>
          <AlignLeftIcon size={TEXT_ALIGN_ICON_SIZE} fill={fill} />
        </Box>
      )
    case "justify":
      return <AlignJustifyIcon size={TEXT_ALIGN_ICON_SIZE} fill={fill} />
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

  const handleFormatClear = () => {
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "isItalic", undefined, viewport)
      setResponsiveStyleProp(props, "isUnderline", undefined, viewport)
      setResponsiveStyleProp(props, "isStrikethrough", undefined, viewport)
      setResponsiveStyleProp(props, "textDecoration", undefined, viewport)
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

        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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

          <Box sx={{ display: "flex", columnGap: "8px" }}>
            <CraftSettingsValueWithUnit
              label="Size"
              value={getResponsiveStyleProp(
                selectedProps as unknown as Record<string, unknown>,
                "fontSize",
                viewport,
              )}
              onCommit={handleFontSizeCommit}
              allowedUnits={FONT_SIZE_UNIT_MENU}
              placeholder=""
            />

            <CraftSettingsValueWithUnit
              label="Height"
              value={getResponsiveStyleProp(
                selectedProps as unknown as Record<string, unknown>,
                "lineHeight",
                viewport,
              )}
              onCommit={handleLineHeightCommit}
              allowedUnits={FONT_SIZE_UNIT_MENU}
              placeholder=""
            />
          </Box>

          {/* Color */}
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
          />

          {/* Capitalize */}
          <CraftSettingsButtonGroup
            label="Capitalize"
            value={(getResponsiveStyleProp(selectedProps as unknown as Record<string, unknown>, "textTransform", viewport) as string | undefined) ?? "none"}
            options={[
              { id: "none", content: "x" },
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

          {/* Stroke */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "102px 1fr",
              gap: "8px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <CraftSettingsInput
              label="Stroke"
              type="number"
              value={(getResponsiveStyleProp(selectedProps as unknown as Record<string, unknown>, "strokeWidth", viewport) as number | undefined) ?? 0}
              onChange={handleStrokeWidthChange}
              customStyles={{ columnGap: "26px" }}
            />

            <CraftSettingsColorField
              label="Color"
              value={strokeColorDraft}
              onChange={handleStrokeColorChange}
            />
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

