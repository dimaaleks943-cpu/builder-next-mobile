import { useState, type ChangeEvent, type MouseEvent } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ClickAwayListener,
  IconButton,
  Popper,
  Typography,
} from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../../theme/colors.ts"
import { ChevronDownIcon } from "../../../../icons/ChevronDownIcon.tsx"
import { CraftSettingsValueWithUnit } from "../../components/craftSettingsControls/CraftSettingsValueWithUnit.tsx"
import { CraftSettingsButtonGroup } from "../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsInput } from "../../components/craftSettingsControls/CraftSettingsInput.tsx"
import { CraftSettingsSelect } from "../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { CraftSettingsResetLabelWithPopper } from "../../components/craftSettingsControls/CraftSettingsResetLabelWithPopper.tsx"
import { ChevronDuoDownIcon } from "../../../../icons/ChevronDuoDownIcon.tsx"
import { CropRoundedIcon } from "../../../../icons/CropRoundedIcon.tsx"
import { EyeHideIcon } from "../../../../icons/EyeHideIcon.tsx"
import { EyeIcon } from "../../../../icons/EyeIcon.tsx"
import { useBuilderModeContext } from "../../context/BuilderModeContext.tsx"
import { MODE_TYPE } from "../../builder.enum.ts"
import { usePreviewViewport } from "../../context/PreviewViewportContext.tsx"
import { CSS_SIZE_UNITS_RN } from "../../../../utils/craftCssSizeProp.ts"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../../responsiveStyle.ts"
import { BorderBoxIcon } from "../../../../icons/BorderBoxIcon.tsx"
import { ContentBoxIcon } from "../../../../icons/ContentBoxIcon.tsx"
import { MoreHorizontalIcon } from "../../../../icons/MoreHorizontalIcon.tsx"
import { BackgroundPositionNineGrid } from "../BackgroundPositionNineGrid/BackgroundPositionNineGrid.tsx"
import {
  ImageGradientMenuPaper,
  InsetAxisLabel,
  InsetAxisRow,
  MenuRow,
  PositionBlock,
  PositionInputsColumn,
} from "../BackgroundAccordion/components/ImageGradientMenuPopper.styles.ts"
import { BACKGROUND_POSITION_UNIT_MENU } from "../../../../utils/craftCssSizeProp.ts"
import {
  aspectRatioKeyMatchesPreset,
  bumpAspectRatioOffPresets, getAspectRatioSelectId, joinObjectPositionDimensions,
  normalizeAspectRatioKey, parseAspectRatioParts, splitObjectPositionDimensions
} from "./sizeAccordion.utils.ts";
import { ASPECT_RATIO_CUSTOM_FALLBACK } from "./sizeAccordion.const.ts";

type SizeFieldKey =
  | "width"
  | "height"
  | "minWidth"
  | "minHeight"
  | "maxWidth"
  | "maxHeight"

const OVERFLOW_IDS = new Set(["visible", "hidden", "clip", "scroll", "auto"])

const BOX_SIZING_IDS = new Set(["border-box", "content-box"])

const OBJECT_FIT_IDS = new Set([
  "fill",
  "contain",
  "cover",
  "none",
  "scale-down",
])

const OBJECT_FIT_SELECT_OPTIONS: { id: string; value: string }[] = [
  { id: "fill", value: "Fill" },
  { id: "contain", value: "Contain" },
  { id: "cover", value: "Cover" },
  { id: "none", value: "None" },
  { id: "scale-down", value: "Scale down" },
]

const objectPositionPopperModifiers = [
  { name: "offset", options: { offset: [0, 6] } },
  { name: "flip", enabled: false },
] as const

const ASPECT_RATIO_SELECT_OPTIONS: { id: string; value: string }[] = [
  { id: "auto", value: "Auto" },
  { id: "2.39 / 1", value: "Anamorphic (2.39:1)" },
  { id: "2 / 1", value: "Univisium/Netflix (2:1)" },
  { id: "16 / 9", value: "Widescreen (16:9)" },
  { id: "3 / 2", value: "Landscape (3:2)" },
  { id: "2 / 3", value: "Portrait (2:3)" },
  { id: "1 / 1", value: "Square (1:1)" },
  { id: "__custom__", value: "Custom" },
]

const SIZE_VALUE_INPUT_WIDTH_PX = "80px";

export const SizeAccordion = () => {
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

  if (!selectedId || !selectedProps) {
    return null
  }

  const handleSizeCommit =
    (key: SizeFieldKey) => (next: string | number | undefined) => {
      actions.setProp(selectedId, (props: any) => {
        setResponsiveStyleProp(props, key, next, viewport)
      })
    }

  const overflowIconFill = COLORS.purple400

  const overflowRaw = getResponsiveStyleProp(selectedProps, "overflow", viewport)
  const overflowStr =
    overflowRaw !== undefined && overflowRaw !== null
      ? String(overflowRaw).trim()
      : ""
  const overflowToggleValue = OVERFLOW_IDS.has(overflowStr) ? overflowStr : undefined
  const hasOverflowExplicit = overflowStr !== ""

  const handleOverflowChange = (next: string) => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "overflow", next, viewport)
    })
  }

  const resetOverflow = () => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "overflow", undefined, viewport)
    })
  }

  const [moreSizeOptionsOpen, setMoreSizeOptionsOpen] = useState(false)

  const aspectRatioRaw = getResponsiveStyleProp(
    selectedProps,
    "aspectRatio",
    viewport,
  )
  const aspectRatioStr =
    aspectRatioRaw !== undefined && aspectRatioRaw !== null
      ? String(aspectRatioRaw).trim()
      : ""
  const hasAspectRatioExplicit = aspectRatioStr !== ""
  const ratioSelectId = getAspectRatioSelectId(aspectRatioStr)

  const handleRatioSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value
    actions.setProp(selectedId, (props: any) => {
      if (next === "__custom__") {
        const cur = aspectRatioStr.trim()
        if (cur && cur !== "auto") {
          const normalized = normalizeAspectRatioKey(cur)
          const forCustomUi = aspectRatioKeyMatchesPreset(normalized)
            ? bumpAspectRatioOffPresets(normalized)
            : normalized
          setResponsiveStyleProp(props, "aspectRatio", forCustomUi, viewport)
        } else {
          setResponsiveStyleProp(
            props,
            "aspectRatio",
            ASPECT_RATIO_CUSTOM_FALLBACK,
            viewport,
          )
        }
        return
      }
      if (next === "auto") {
        setResponsiveStyleProp(props, "aspectRatio", "auto", viewport)
        return
      }
      setResponsiveStyleProp(props, "aspectRatio", next, viewport)
    })
  }

  const resetAspectRatio = () => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "aspectRatio", undefined, viewport)
    })
  }

  const handleCustomRatioPartChange =
    (part: "w" | "h") => (event: ChangeEvent<HTMLInputElement>) => {
      const nextVal = event.target.value
      const { w, h } = parseAspectRatioParts(aspectRatioStr)
      const nw = part === "w" ? nextVal : w
      const nh = part === "h" ? nextVal : h
      actions.setProp(selectedId, (props: any) => {
        const safeW = nw.trim() || "1"
        const safeH = nh.trim() || "1"
        setResponsiveStyleProp(
          props,
          "aspectRatio",
          `${safeW} / ${safeH}`,
          viewport,
        )
      })
    }

  const boxSizingRaw = getResponsiveStyleProp(
    selectedProps,
    "boxSizing",
    viewport,
  )
  const boxSizingStr =
    boxSizingRaw !== undefined && boxSizingRaw !== null
      ? String(boxSizingRaw).trim()
      : ""
  const boxSizingToggleValue = BOX_SIZING_IDS.has(boxSizingStr)
    ? boxSizingStr
    : undefined
  const hasBoxSizingExplicit = boxSizingStr !== ""

  const handleBoxSizingChange = (next: string) => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "boxSizing", next, viewport)
    })
  }

  const resetBoxSizing = () => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "boxSizing", undefined, viewport)
    })
  }

  const [objectPositionAnchorEl, setObjectPositionAnchorEl] =
    useState<HTMLElement | null>(null)
  const objectPositionPopperOpen = Boolean(objectPositionAnchorEl)

  const objectFitRaw = getResponsiveStyleProp(selectedProps, "objectFit", viewport)
  const objectFitStr =
    objectFitRaw !== undefined && objectFitRaw !== null
      ? String(objectFitRaw).trim()
      : ""
  const objectFitSelectValue = OBJECT_FIT_IDS.has(objectFitStr)
    ? objectFitStr
    : "fill"
  const hasObjectFitExplicit = objectFitStr !== ""

  const handleObjectFitChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "objectFit", next, viewport)
    })
  }

  const handleObjectFitSelectPointerDown = () => {
    if (hasObjectFitExplicit) return
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "objectFit", "fill", viewport)
    })
  }

  const resetObjectFit = () => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "objectFit", undefined, viewport)
    })
  }

  const objectPositionValueRaw = getResponsiveStyleProp(
    selectedProps,
    "objectPosition",
    viewport,
  )
  const objectPositionValue =
    objectPositionValueRaw !== undefined && objectPositionValueRaw !== null
      ? String(objectPositionValueRaw).trim()
      : ""
  const hasObjectPositionExplicit = objectPositionValue !== ""

  const positionDims = splitObjectPositionDimensions(
    objectPositionValue === "" ? undefined : objectPositionValue,
  )

  const commitObjectPosition = (next: string | undefined) => {
    actions.setProp(selectedId, (props: any) => {
      setResponsiveStyleProp(props, "objectPosition", next, viewport)
    })
  }

  const resetObjectPosition = () => {
    commitObjectPosition(undefined)
  }

  const handleObjectPositionPairCommit = (nextPair: string) => {
    commitObjectPosition(nextPair)
  }

  const handleObjectPositionXCommit = (next: string | number | undefined) => {
    const cur =
      objectPositionValue === "" ? undefined : objectPositionValue
    const { y } = splitObjectPositionDimensions(cur)
    commitObjectPosition(joinObjectPositionDimensions(next, y))
  }

  const handleObjectPositionYCommit = (next: string | number | undefined) => {
    const cur =
      objectPositionValue === "" ? undefined : objectPositionValue
    const { x } = splitObjectPositionDimensions(cur)
    commitObjectPosition(joinObjectPositionDimensions(x, next))
  }

  const toggleObjectPositionPopper = (event: MouseEvent<HTMLElement>) => {
    setObjectPositionAnchorEl((prev) =>
      prev ? null : event.currentTarget,
    )
  }

  const inputWidth = SIZE_VALUE_INPUT_WIDTH_PX
  const customRatioParts = parseAspectRatioParts(aspectRatioStr)

  return (
    <Accordion disableGutters>
      <AccordionSummary
        sx={{
          minHeight: 40,
          "& .MuiAccordionSummary-content": { margin: 0 },
        }}
      >
        <Typography sx={{ color: COLORS.gray700, fontSize: "12px" }}>
          Размеры
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {isRn ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <CraftSettingsValueWithUnit
                label="Width"
                value={getResponsiveStyleProp(selectedProps, "width", viewport)}
                onCommit={handleSizeCommit("width")}
                allowedUnits={CSS_SIZE_UNITS_RN}
                mode="rn"
                inputWidth={inputWidth}
              />
              <CraftSettingsValueWithUnit
                label="Height"
                value={getResponsiveStyleProp(selectedProps, "height", viewport)}
                onCommit={handleSizeCommit("height")}
                allowedUnits={CSS_SIZE_UNITS_RN}
                mode="rn"
                inputWidth={inputWidth}
              />
              <Box sx={{ gridColumn: "1 / -1" }}>
                <CraftSettingsValueWithUnit
                  label="Min H"
                  value={getResponsiveStyleProp(selectedProps, "minHeight", viewport)}
                  onCommit={handleSizeCommit("minHeight")}
                  allowedUnits={CSS_SIZE_UNITS_RN}
                  mode="rn"
                  inputWidth={inputWidth}
                />
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <CraftSettingsValueWithUnit
                label="Width"
                value={getResponsiveStyleProp(selectedProps, "width", viewport)}
                onCommit={handleSizeCommit("width")}
                mode="web"
                inputWidth={inputWidth}
              />
              <CraftSettingsValueWithUnit
                label="Height"
                value={getResponsiveStyleProp(selectedProps, "height", viewport)}
                onCommit={handleSizeCommit("height")}
                mode="web"
                inputWidth={inputWidth}
              />
              <CraftSettingsValueWithUnit
                label="Min W"
                value={getResponsiveStyleProp(selectedProps, "minWidth", viewport)}
                onCommit={handleSizeCommit("minWidth")}
                mode="web"
                inputWidth={inputWidth}
              />
              <CraftSettingsValueWithUnit
                label="Min H"
                value={getResponsiveStyleProp(selectedProps, "minHeight", viewport)}
                onCommit={handleSizeCommit("minHeight")}
                mode="web"
                inputWidth={inputWidth}
              />
              <CraftSettingsValueWithUnit
                label="Max W"
                value={getResponsiveStyleProp(selectedProps, "maxWidth", viewport)}
                onCommit={handleSizeCommit("maxWidth")}
                mode="web"
                placeholder="None"
                inputWidth={inputWidth}
              />
              <CraftSettingsValueWithUnit
                label="Max H"
                value={getResponsiveStyleProp(selectedProps, "maxHeight", viewport)}
                onCommit={handleSizeCommit("maxHeight")}
                mode="web"
                placeholder="None"
                inputWidth={inputWidth}
              />
            </Box>
          )}

          {!isRn ? (
            <CraftSettingsButtonGroup
              label="Overflow"
              value={overflowToggleValue}
              resetLabelActive={hasOverflowExplicit}
              options={[
                {
                  id: "visible",
                  content: <EyeIcon size={16} fill={overflowIconFill}/>,
                },
                {
                  id: "hidden",
                  content: <EyeHideIcon size={16} fill={overflowIconFill}/>,
                },
                {
                  id: "clip",
                  content: (
                    <Box sx={{ display: "flex", transform: "rotate(-90deg)" }}>
                      <CropRoundedIcon size={16} fill={overflowIconFill}/>
                    </Box>
                  ),
                },
                {
                  id: "scroll",
                  content: <ChevronDuoDownIcon size={16} fill={overflowIconFill}/>,
                },
                {
                  id: "auto",
                  content: "АВТО",
                },
              ]}
              onChange={handleOverflowChange}
              onReset={resetOverflow}
            />
          ) : null}

          {!isRn ? (
            <>
              <Box
                component="button"
                type="button"
                onClick={() => setMoreSizeOptionsOpen((open) => !open)}
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
                    transform: moreSizeOptionsOpen ? "rotate(180deg)" : "none",
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
                  More size options
                </Typography>
              </Box>

              {moreSizeOptionsOpen ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <CraftSettingsSelect
                    label="Ratio"
                    value={ratioSelectId}
                    onChange={handleRatioSelectChange}
                    options={ASPECT_RATIO_SELECT_OPTIONS}
                    labelReset={{
                      hasValue: hasAspectRatioExplicit,
                      onReset: resetAspectRatio,
                    }}
                  />

                  {ratioSelectId === "__custom__" ? (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        columnGap: "8px",
                        alignItems: "start",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "2px",
                          minWidth: 0,
                        }}
                      >
                        <CraftSettingsInput
                          label="Width"
                          type="text"
                          hideLabel
                          value={customRatioParts.w}
                          onChange={handleCustomRatioPartChange("w")}
                        />
                        <Typography sx={{ fontSize: "8px", lineHeight: "10px", color: COLORS.gray700, }}>
                          Width
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          lineHeight: "14px",
                          color: COLORS.gray700,
                          paddingTop: "6px",
                        }}
                      >
                        :
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "2px",
                          minWidth: 0,
                        }}
                      >
                        <CraftSettingsInput
                          label="Height"
                          type="text"
                          hideLabel
                          value={customRatioParts.h}
                          onChange={handleCustomRatioPartChange("h")}
                        />
                        <Typography
                          sx={{
                            fontSize: "8px",
                            lineHeight: "10px",
                            color: COLORS.gray700,
                          }}
                        >
                          Height
                        </Typography>
                      </Box>
                    </Box>
                  ) : null}

                  <CraftSettingsButtonGroup
                    label="Box size"
                    value={boxSizingToggleValue}
                    resetLabelActive={hasBoxSizingExplicit}
                    options={[
                      { id: "border-box", content: <BorderBoxIcon/> },
                      { id: "content-box", content: <ContentBoxIcon/> },
                    ]}
                    onChange={handleBoxSizingChange}
                    onReset={resetBoxSizing}
                  />
                </Box>
              ) : null}
            </>
          ) : null}

          {!isRn ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <CraftSettingsSelect
                    label="Fit"
                    value={objectFitSelectValue}
                    onChange={handleObjectFitChange}
                    onNativeSelectPointerDown={handleObjectFitSelectPointerDown}
                    options={OBJECT_FIT_SELECT_OPTIONS}
                    labelReset={{
                      hasValue: hasObjectFitExplicit,
                      onReset: resetObjectFit,
                    }}
                  />
                </Box>
                <IconButton
                  disableRipple
                  size="small"
                  aria-label="Object position"
                  onClick={toggleObjectPositionPopper}
                  sx={{
                    flexShrink: 0,
                    padding: "4px",
                    color: COLORS.gray700,
                    "&:hover": {
                      backgroundColor: COLORS.secondaryVeryLightGray,
                    },
                  }}
                >
                  <MoreHorizontalIcon size={16} fill={COLORS.gray700}/>
                </IconButton>
              </Box>

              <Popper
                open={objectPositionPopperOpen}
                anchorEl={objectPositionAnchorEl}
                placement="bottom-end"
                modifiers={[...objectPositionPopperModifiers]}
                style={{ zIndex: 4000 }}
              >
                <ClickAwayListener
                  onClickAway={() => {
                    setObjectPositionAnchorEl(null)
                  }}
                >
                  <ImageGradientMenuPaper elevation={0}>
                    <MenuRow sx={{ padding: "8px" }}>
                      <Box sx={{ alignSelf: "start" }}>
                        <CraftSettingsResetLabelWithPopper
                          kind="labelReset"
                          label="Position"
                          variant="fixed"
                          disableResetPopperPortal
                          labelReset={{
                            hasValue: hasObjectPositionExplicit,
                            onReset: resetObjectPosition,
                          }}
                        />
                      </Box>
                      <PositionBlock>
                        <BackgroundPositionNineGrid
                          positionPair={joinObjectPositionDimensions(
                            positionDims.x,
                            positionDims.y,
                          )}
                          onCommitPair={handleObjectPositionPairCommit}
                        />
                        <PositionInputsColumn>
                          <InsetAxisRow>
                            <InsetAxisLabel>Left</InsetAxisLabel>
                            <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
                              <CraftSettingsValueWithUnit
                                label="Left"
                                withoutLabel
                                disableUnitPopperPortal
                                unitAffixVariant="mutedLowercase"
                                allowedUnits={BACKGROUND_POSITION_UNIT_MENU}
                                value={positionDims.x}
                                onCommit={handleObjectPositionXCommit}
                                mode="web"
                                placeholder="50"
                                inputWidth="100%"
                                customWidth="100%"
                              />
                            </Box>
                          </InsetAxisRow>
                          <InsetAxisRow>
                            <InsetAxisLabel>Top</InsetAxisLabel>
                            <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
                              <CraftSettingsValueWithUnit
                                label="Top"
                                withoutLabel
                                disableUnitPopperPortal
                                unitAffixVariant="mutedLowercase"
                                allowedUnits={BACKGROUND_POSITION_UNIT_MENU}
                                value={positionDims.y}
                                onCommit={handleObjectPositionYCommit}
                                mode="web"
                                placeholder="50"
                                inputWidth="100%"
                                customWidth="100%"
                              />
                            </Box>
                          </InsetAxisRow>
                        </PositionInputsColumn>
                      </PositionBlock>
                    </MenuRow>
                  </ImageGradientMenuPaper>
                </ClickAwayListener>
              </Popper>
            </>
          ) : null}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
