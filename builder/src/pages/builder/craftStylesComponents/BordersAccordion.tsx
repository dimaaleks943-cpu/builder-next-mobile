import type { ChangeEvent } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Typography,
} from "@mui/material"
import { COLORS } from "../../../theme/colors.ts"
import { CraftSettingsPercentSliderRow } from "../components/craftSettingsControls/CraftSettingsPercentSliderRow.tsx"
import { CraftSettingsButtonGroup } from "../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsInput } from "../components/craftSettingsControls/CraftSettingsInput.tsx"
import { CraftSettingsColorField } from "../components/craftSettingsControls/CraftSettingsColorField.tsx"
import {
  BorderSidesFrame,
  type BorderSide,
} from "./BorderSidesFrame.tsx"
import { useBorderSidesControl } from "../hooks/useBorderSidesControl.tsx";
import { usePreviewViewport } from "../context/PreviewViewportContext.tsx"
import { useStyleEditing } from "../hooks/useStyleEditing.ts"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../responsiveStyle.ts"
import { BorderIcon } from "../../../icons/BorderIcon.tsx"
import { BorderDashIcon } from "../../../icons/BorderDashIcon.tsx"
import { BorderDashCornIcon } from "../../../icons/BorderDashCornIcon.tsx"
import { CloseIcon } from "../../../icons/CloseIcon.tsx"
import { MinusIcon } from "../../../icons/MinusIcon.tsx"
import { DashedIcon } from "../../../icons/DashedIcon.tsx"
import { MoreHorizontalIcon } from "../../../icons/MoreHorizontalIcon.tsx"
import {
  formatBorderColorWithAlpha,
  parseBorderColorForUi,
} from "../../../utils/colorUtils.ts"

const BORDER_RADIUS_MAX_PX = 100
const BORDER_COLOR_DEBOUNCE_MS = 200

enum BORDER_RADIUS_MODE {
  CORNERS = "corners",
  UNIFORM = "uniform"
}

const borderRadiusToPercent = (px: number) => {
  const n = Number.isFinite(px) ? px : 0
  return Math.min(100, Math.max(0, Math.round((n / BORDER_RADIUS_MAX_PX) * 100)))
}

const percentToBorderRadius = (percent: number) => {
  const c = Math.min(100, Math.max(0, Number.isFinite(percent) ? percent : 0))
  return Math.round((c / 100) * BORDER_RADIUS_MAX_PX)
}

const parsePxToken = (token: string) => {
  const t = token.trim()
  const m = /^([\d.]+)px$/i.exec(t) ?? /^([\d.]+)$/.exec(t)
  return m ? Math.max(0, Math.round(Number(m[1]))) : 0
}

const expandBorderRadiusToCorners = (raw: unknown): [number, number, number, number] => {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const v = Math.max(0, raw)
    return [v, v, v, v]
  }
  if (typeof raw !== "string") {
    return [0, 0, 0, 0]
  }
  const parts = raw
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(parsePxToken)
  if (parts.length === 0) {
    return [0, 0, 0, 0]
  }
  if (parts.length === 1) {
    const v = parts[0]
    return [v, v, v, v]
  }
  if (parts.length === 2) {
    return [parts[0], parts[1], parts[0], parts[1]]
  }
  if (parts.length === 3) {
    return [parts[0], parts[1], parts[2], parts[1]]
  }
  return [parts[0], parts[1], parts[2], parts[3]]
}

const isCornersRadiusStored = (raw: unknown) => {
  if (typeof raw !== "string") {
    return false
  }
  const parts = raw.trim().split(/\s+/).filter(Boolean)
  return parts.length >= 2
}

const formatCornersRadiusShorthand = (c: [number, number, number, number]) =>
  `${c[0]}px ${c[1]}px ${c[2]}px ${c[3]}px`

const cornersToUniformPx = (c: [number, number, number, number]) =>
  c.every((x) => x === c[0]) ? c[0] : Math.round((c[0] + c[1] + c[2] + c[3]) / 4)

/** Угол иконки по индексу в shorthand: 0 TL, 1 TR, 2 BR, 3 BL */
const cssCornerIconRotateDeg = [270, 360, 90, 180] as const

/** Порядок ячеек сетки 2×2: TL, TR, BL, BR → индексы в border-radius shorthand */
const radiusCornerGridCssIndices = [0, 1, 3, 2] as const

type BorderStyleUi = "none" | "solid" | "dashed" | "dotted"

const borderStyleForButtonGroup = (value: string | undefined): BorderStyleUi => {
  if (value === "none" || value === "solid" || value === "dashed" || value === "dotted") return value
  return "solid"
}

export const BordersAccordion = () => {
  const viewport = usePreviewViewport()
  const { selectedId, getStyleProp, setStyleProp, mutateClassStyle } = useStyleEditing()
  const { activeSides, toggleSide, toggleAllSides, isSideActive } = useBorderSidesControl()

  const borderColorFromProps = useMemo(
    () => getStyleProp("borderColor") as string | undefined,
    [getStyleProp],
  )

  const parsedBorderColor = useMemo(
    () => parseBorderColorForUi(borderColorFromProps),
    [borderColorFromProps],
  )

  const [localBorderHex, setLocalBorderHex] = useState(parsedBorderColor.hex)
  const [localBorderOpacityPercent, setLocalBorderOpacityPercent] = useState(
    () => Math.round(parsedBorderColor.alpha * 100),
  )

  const pendingBorderHexRef = useRef(parsedBorderColor.hex)
  const borderOpacityPercentRef = useRef(Math.round(parsedBorderColor.alpha * 100))
  const borderColorDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalBorderHex(parsedBorderColor.hex)
    const p = Math.round(parsedBorderColor.alpha * 100)
    setLocalBorderOpacityPercent(p)
    pendingBorderHexRef.current = parsedBorderColor.hex
    borderOpacityPercentRef.current = p
  }, [selectedId, parsedBorderColor.hex, parsedBorderColor.alpha])

  useEffect(() => {
    borderOpacityPercentRef.current = localBorderOpacityPercent
  }, [localBorderOpacityPercent])

  useEffect(() => {
    pendingBorderHexRef.current = localBorderHex
  }, [localBorderHex])

  useEffect(
    () => () => {
      if (borderColorDebounceRef.current) clearTimeout(borderColorDebounceRef.current)
    },
    [],
  )

  useEffect(() => {
    if (borderColorDebounceRef.current) {
      clearTimeout(borderColorDebounceRef.current)
      borderColorDebounceRef.current = null
    }
  }, [selectedId])

  const commitBorderColorToProps = useCallback(
    (hex: string, alpha01: number) => {
      if (!selectedId) return
      const stored = formatBorderColorWithAlpha(hex, alpha01)
      if (!stored) return
      setStyleProp("borderColor", stored)
    },
    [selectedId, setStyleProp],
  )

  const scheduleBorderColorCommit = useCallback(() => {
    if (!selectedId) return
    if (borderColorDebounceRef.current) clearTimeout(borderColorDebounceRef.current)
    borderColorDebounceRef.current = setTimeout(() => {
      borderColorDebounceRef.current = null
      commitBorderColorToProps(
        pendingBorderHexRef.current,
        borderOpacityPercentRef.current / 100,
      )
    }, BORDER_COLOR_DEBOUNCE_MS)
  }, [selectedId, commitBorderColorToProps])

  const handleBorderColorFieldChange = useCallback(
    (value: string) => {
      setLocalBorderHex(value)
      pendingBorderHexRef.current = value
      scheduleBorderColorCommit()
    },
    [scheduleBorderColorCommit],
  )

  const handleBorderOpacityPercentChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!selectedId) return
    const next = Number(event.target.value)
    const safe = Math.min(100, Math.max(0, Number.isNaN(next) ? 0 : next))
    setLocalBorderOpacityPercent(safe)
    borderOpacityPercentRef.current = safe
    if (borderColorDebounceRef.current) {
      clearTimeout(borderColorDebounceRef.current)
      borderColorDebounceRef.current = null
    }
    commitBorderColorToProps(pendingBorderHexRef.current, safe / 100)
  }

  if (!selectedId) {
    return null
  }

  const rawBorderRadius = getStyleProp("borderRadius")
  const radiusUiMode: BORDER_RADIUS_MODE = isCornersRadiusStored(rawBorderRadius) ? BORDER_RADIUS_MODE.CORNERS : BORDER_RADIUS_MODE.UNIFORM
  const cornersPx = expandBorderRadiusToCorners(rawBorderRadius)
  const radiusPercent = borderRadiusToPercent(cornersPx[0])

  const handleRadiusModeUniform = () => {
    const c = expandBorderRadiusToCorners(getStyleProp("borderRadius"))
    setStyleProp("borderRadius", cornersToUniformPx(c))
  }

  const handleRadiusModeCorners = () => {
    const c = expandBorderRadiusToCorners(getStyleProp("borderRadius"))
    setStyleProp("borderRadius", formatCornersRadiusShorthand(c))
  }

  const handleUniformPercentChange = (value: number) => {
    const px = percentToBorderRadius(value)
    setStyleProp("borderRadius", px)
  }

  const handleCornerPxChange = (cornerIndex: 0 | 1 | 2 | 3, nextPx: number) => {
    const safe = Math.max(0, Math.round(Number.isFinite(nextPx) ? nextPx : 0))
    mutateClassStyle((draft) => {
      const raw = getResponsiveStyleProp(draft, "borderRadius", viewport)
      const c = expandBorderRadiusToCorners(raw)
      const nextCorners: [number, number, number, number] = [...c]
      nextCorners[cornerIndex] = safe
      setResponsiveStyleProp(
        draft,
        "borderRadius",
        formatCornersRadiusShorthand(nextCorners),
        viewport,
      )
    })
  }

  const styleGroupValue = borderStyleForButtonGroup(
    getStyleProp("borderStyle") as string | undefined,
  )

  const handleBorderStyleChange = (id: string) => {
    setStyleProp("borderStyle", id)
  }

  const sidesForWidth: BorderSide[] =
    activeSides === "all" ? ["top", "right", "bottom", "left"] : activeSides

  return (
    <Accordion disableGutters>
      <AccordionSummary
        sx={{
          minHeight: 40,
          "& .MuiAccordionSummary-content": { margin: 0 },
        }}
      >
        <Typography variant="subtitle2" sx={{ color: COLORS.gray700 }}>
          Границы
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "48px auto 1fr",
                columnGap: "8px",
                width: "100%",
                boxSizing: "border-box",
                alignItems: radiusUiMode === BORDER_RADIUS_MODE.CORNERS ? "start" : "center",
              }}
            >
              <Typography sx={{ fontSize: "10px", lineHeight: "14px", color: COLORS.gray700 }}>
                Radius
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexShrink: 0,
                  padding: "1px",
                }}
              >
                <IconButton
                  aria-label="Единый радиус"
                  onClick={handleRadiusModeUniform}
                  disableRipple
                  sx={{
                    width: 16,
                    height: 16,
                    padding: 0,
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "2px",
                    backgroundColor: radiusUiMode === BORDER_RADIUS_MODE.UNIFORM ? COLORS.purple100 : COLORS.white,
                  }}
                >
                  <BorderIcon
                    size={16}
                    fill={radiusUiMode === BORDER_RADIUS_MODE.UNIFORM ? COLORS.purple400 : COLORS.gray700}
                  />
                </IconButton>
                <IconButton
                  disableRipple
                  aria-label="Радиус по углам"
                  onClick={handleRadiusModeCorners}
                  sx={{
                    width: 16,
                    height: 16,
                    padding: 0,
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "2px",
                    backgroundColor: radiusUiMode === BORDER_RADIUS_MODE.CORNERS ? COLORS.purple100 : COLORS.white,
                  }}
                >
                  <BorderDashIcon
                    size={16}
                    fill={radiusUiMode === BORDER_RADIUS_MODE.CORNERS ? COLORS.purple400 : COLORS.gray700}
                  />
                </IconButton>
              </Box>
              {radiusUiMode === BORDER_RADIUS_MODE.UNIFORM && (
                <CraftSettingsPercentSliderRow
                  label="Radius"
                  hideLabel
                  value={radiusPercent}
                  onChange={handleUniformPercentChange}
                />
              )}
              {radiusUiMode === BORDER_RADIUS_MODE.CORNERS && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "75px 75px",
                    gap: "6px",
                    minWidth: 0,
                    width: "100%",
                  }}
                >
                  {radiusCornerGridCssIndices.map((cssCornerIndex) => (
                    <Box
                      key={cssCornerIndex}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        boxSizing: "border-box",
                        padding: "4px 6px",
                        borderRadius: "4px",
                        border: `1px solid ${COLORS.purple100}`,
                        backgroundColor: COLORS.white,
                        gap: "4px",
                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          flexShrink: 0,
                          width: 16,
                          height: 16,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transform: `rotate(${cssCornerIconRotateDeg[cssCornerIndex]}deg)`,
                        }}
                      >
                        <BorderDashCornIcon size={14} fill={COLORS.gray700}/>
                      </Box>
                      <Box
                        component="input"
                        type="number"
                        value={cornersPx[cssCornerIndex]}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const next = Number(event.target.value)
                          handleCornerPxChange(cssCornerIndex, Number.isNaN(next) ? 0 : next)
                        }}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          width: 0,
                          border: "none",
                          outline: "none",
                          padding: 0,
                          fontSize: "12px",
                          lineHeight: "14px",
                          color: COLORS.black,
                          textAlign: "right",

                          "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                            WebkitAppearance: "none",
                            margin: 0,
                          },
                        }}
                      />
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "12px",
                          lineHeight: "14px",
                          color: COLORS.gray700,
                          flexShrink: 0,
                        }}
                      >
                        px
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: "10px",
                lineHeight: "14px",
                color: COLORS.gray700,
                mb: "6px",
                display: "block",
              }}
            >
              Borders
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "31px",
              }}
            >
              <BorderSidesFrame
                activeSides={activeSides}
                isSideActive={isSideActive}
                onToggleSide={toggleSide}
                onToggleAllSides={toggleAllSides}
              />

              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <CraftSettingsButtonGroup
                  label="Style"
                  value={styleGroupValue}
                  onChange={handleBorderStyleChange}
                  options={[
                    { id: "none", content: <CloseIcon size={14} fill={COLORS.purple400} /> },
                    { id: "solid", content: <MinusIcon size={14} fill={COLORS.purple400} /> },
                    { id: "dashed", content: <DashedIcon size={14} fill={COLORS.purple400} /> },
                    { id: "dotted", content: <MoreHorizontalIcon size={14} fill={COLORS.purple400} /> },
                  ]}
                />

                <CraftSettingsInput
                  label="Width"
                  type="number"
                  value={(getStyleProp("borderTopWidth") as number | undefined) ?? 0}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const next = Number(event.target.value)
                    const safe = Number.isNaN(next) ? 0 : next

                    mutateClassStyle((draft) => {
                      if (sidesForWidth.includes("top")) setResponsiveStyleProp(draft, "borderTopWidth", safe, viewport)
                      if (sidesForWidth.includes("right")) setResponsiveStyleProp(draft, "borderRightWidth", safe, viewport)
                      if (sidesForWidth.includes("bottom")) setResponsiveStyleProp(draft, "borderBottomWidth", safe, viewport)
                      if (sidesForWidth.includes("left")) setResponsiveStyleProp(draft, "borderLeftWidth", safe, viewport)
                    })
                  }}
                />

                <CraftSettingsColorField
                  label="Color"
                  value={localBorderHex}
                  onChange={handleBorderColorFieldChange}
                />

                <CraftSettingsInput
                  label="Opacity"
                  type="number"
                  value={localBorderOpacityPercent}
                  onChange={handleBorderOpacityPercentChange}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
