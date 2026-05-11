import { Box, Popper, Typography } from "@mui/material"
import type { ChangeEvent, MouseEvent as ReactMouseEvent, Ref } from "react"
import { useEffect, useRef, useState } from "react"
import { COLORS } from "../../../../../theme/colors.ts"
import { AppsIcon } from "../../../../../icons/AppsIcon.tsx"
import { AssetsIcon } from "../../../../../icons/AssetsIcon.tsx"
import { CloseIcon } from "../../../../../icons/CloseIcon.tsx"
import { GradientRoundedIcon } from "../../../../../icons/GradientRoundedIcon.tsx"
import { MoreHorizontalIcon } from "../../../../../icons/MoreHorizontalIcon.tsx"
import { OverlayRoundedIcon } from "../../../../../icons/OverlayRoundedIcon.tsx"
import { RadialGradientIcon } from "../../../../../icons/RadialGradientIcon.tsx"
import { TileIcon } from "../../../../../icons/TileIcon.tsx"
import { CraftSettingsButtonGroup } from "../../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsValueWithUnit } from "../../../components/craftSettingsControls/CraftSettingsValueWithUnit.tsx"
import { BackgroundPositionNineGrid } from "./BackgroundPositionNineGrid.tsx"
import {
  ChooseImageButtonRow,
  ChooseImageTriggerButton,
  ImageGradientMenuFooterSection,
  ImageGradientMenuPaper,
  ImageGradientMenuSection,
  ImageGradientMenuSectionDense,
  ImageMetaColumn,
  ImagePreviewFrame,
  ImageTransparencyCheckerboard,
  ImageUrlEntryActionsRow,
  ImageUrlEntryButton,
  ImageUrlEntryField,
  ImageUrlEntryPaper,
  ImageUrlEntryPrimaryButton,
  InsetAxisLabel,
  InsetAxisRow,
  MenuRow,
  MenuRowLabel,
  MenuRowSpread,
  PixelDensityCheckbox,
  PixelDensityLabel,
  PixelHintRow,
  PositionBlock,
  PositionInputsColumn,
  UnitFieldCaption,
} from "./ImageGradientMenuPopper.styles.ts"
import {
  BACKGROUND_POSITION_UNIT_MENU,
  BACKGROUND_SIZE_UNIT_MENU,
} from "../../../../../utils/craftCssSizeProp.ts"
import { type BackgroundFillKind, inferBackgroundFillKind, parseCssUrl } from "../backgroundImageLayersUtils.ts";


type BackgroundSizeMode = "custom" | "cover" | "contain"

const DEFAULT_LINEAR_GRADIENT = `linear-gradient(135deg, ${COLORS.purple400} 0%, ${COLORS.purple200} 100%)`

const DEFAULT_RADIAL_GRADIENT = `radial-gradient(circle at 50% 50%, ${COLORS.purple200} 0%, ${COLORS.purple400} 100%)`

const DEFAULT_OVERLAY_LINEAR = `linear-gradient(180deg, rgba(27, 29, 33, 0.5) 0%, rgba(27, 29, 33, 0) 100%)`

const toCssUrlValue = (href: string) => `url(${JSON.stringify(href)})`

const normalizeBackgroundSize = (raw: string | undefined): string =>
  raw?.trim().replace(/\s+/g, " ") ?? ""

const backgroundSizeModeFromValue = (raw: string | undefined): BackgroundSizeMode => {
  const n = normalizeBackgroundSize(raw)
  if (n === "cover") return "cover"
  if (n === "contain") return "contain"
  return "custom"
}

const splitBackgroundSizeDimensions = (
  raw: string | undefined,
): { w: string; h: string } => {
  const n = normalizeBackgroundSize(raw)
  if (!n || n === "cover" || n === "contain") {
    return { w: "auto", h: "auto" }
  }
  const parts = n.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return { w: parts[0], h: "auto" }
  return { w: parts[0], h: parts[1] }
}

const toCssBgDimension = (v: string | number | undefined): string => {
  if (v === undefined || v === null) return "auto"
  const s = String(v).trim()
  return s === "" ? "auto" : s
}

const joinBackgroundSizeDimensions = (
  w: string | number | undefined,
  h: string | number | undefined,
): string | undefined => {
  const ws = toCssBgDimension(w)
  const hs = toCssBgDimension(h)
  if (ws === "auto" && hs === "auto") return "auto"
  return `${ws} ${hs}`
}

const normalizeBackgroundPosition = (raw: string | undefined): string =>
  raw?.trim().replace(/\s+/g, " ") ?? ""

const splitBackgroundPositionDimensions = (
  raw: string | undefined,
): { x: string; y: string } => {
  const n = normalizeBackgroundPosition(raw)
  if (!n) return { x: "0", y: "0" }
  const parts = n.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return { x: parts[0], y: "0" }
  return { x: parts[0], y: parts[1] }
}

const axisToCssBgPosition = (v: string | number | undefined): string => {
  if (v === undefined || v === null) return "0px"
  const s = String(v).trim()
  return s === "" ? "0px" : s
}

const joinBackgroundPositionDimensions = (
  x: string | number | undefined,
  y: string | number | undefined,
): string => `${axisToCssBgPosition(x)} ${axisToCssBgPosition(y)}`

const matchesRetinaHalfBackgroundSize = (
  backgroundSizeValue: string | undefined,
  naturalW: number,
  naturalH: number,
): boolean => {
  const n = normalizeBackgroundSize(backgroundSizeValue)
  if (!n) return false
  const pair = `${naturalW / 2}px ${naturalH / 2}px`
  const widthOnly = `${naturalW / 2}px`
  return (
    n === normalizeBackgroundSize(pair) ||
    (naturalW === naturalH && n === normalizeBackgroundSize(widthOnly))
  )
}

export type BackgroundImageCommitOptions = {
  urlFillDefaults?: "apply" | "clear"
}

interface Props {
  open: boolean
  anchorEl: HTMLElement | null
  popperRef: Ref<HTMLDivElement>
  backgroundImage: string | undefined
  backgroundSize: string | undefined
  backgroundPosition: string | undefined
  backgroundRepeat: string | undefined
  backgroundAttachment: string | undefined
  onCommitBackgroundImage: (
    next: string | undefined,
    options?: BackgroundImageCommitOptions,
  ) => void
  onCommitBackgroundSize: (next: string | undefined) => void
  onCommitBackgroundPosition: (next: string | undefined) => void
  onCommitBackgroundRepeat: (next: string | undefined) => void
  onCommitBackgroundAttachment: (next: string | undefined) => void
}

export const ImageGradientMenuPopper = ({
  open,
  anchorEl,
  popperRef,
  backgroundImage,
  backgroundSize,
  backgroundPosition,
  backgroundRepeat,
  backgroundAttachment,
  onCommitBackgroundImage,
  onCommitBackgroundSize,
  onCommitBackgroundPosition,
  onCommitBackgroundRepeat,
  onCommitBackgroundAttachment,
}: Props) => {
  const [imageUrlPopperAnchor, setImageUrlPopperAnchor] =
    useState<HTMLElement | null>(null)
  const imageUrlPopperPaperRef = useRef<HTMLDivElement | null>(null)
  const [urlDraft, setUrlDraft] = useState("")
  const [naturalImagePx, setNaturalImagePx] =
    useState<{ w: number; h: number } | null>(null)

  const fillKind = inferBackgroundFillKind(backgroundImage)
  const previewHref = fillKind === "url" ? parseCssUrl(backgroundImage) : null

  const backgroundSizeMode = backgroundSizeModeFromValue(backgroundSize)
  const sizeDims = splitBackgroundSizeDimensions(backgroundSize)
  const positionDims = splitBackgroundPositionDimensions(backgroundPosition)
  const customSizeInputsDisabled = backgroundSizeMode !== "custom"

  const handleBackgroundSizeModeChange = (id: string) => {
    if (id === "cover") {
      onCommitBackgroundSize("cover")
      return
    }
    if (id === "contain") {
      onCommitBackgroundSize("contain")
      return
    }
    onCommitBackgroundSize("auto")
  }

  const handleBackgroundWidthCommit = (next: string | number | undefined) => {
    const { h } = splitBackgroundSizeDimensions(backgroundSize)
    onCommitBackgroundSize(joinBackgroundSizeDimensions(next, h))
  }

  const handleBackgroundHeightCommit = (next: string | number | undefined) => {
    const { w } = splitBackgroundSizeDimensions(backgroundSize)
    onCommitBackgroundSize(joinBackgroundSizeDimensions(w, next))
  }

  const handleBackgroundPositionXCommit = (next: string | number | undefined) => {
    const { y } = splitBackgroundPositionDimensions(backgroundPosition)
    onCommitBackgroundPosition(joinBackgroundPositionDimensions(next, y))
  }

  const handleBackgroundPositionYCommit = (next: string | number | undefined) => {
    const { x } = splitBackgroundPositionDimensions(backgroundPosition)
    onCommitBackgroundPosition(joinBackgroundPositionDimensions(x, next))
  }

  useEffect(() => {
    if (!previewHref) {
      setNaturalImagePx(null)
      return
    }
    const img = new Image()
    const onLoad = () => {
      setNaturalImagePx({ w: img.naturalWidth, h: img.naturalHeight })
    }
    const onError = () => {
      setNaturalImagePx(null)
    }
    img.addEventListener("load", onLoad)
    img.addEventListener("error", onError)
    img.src = previewHref
    return () => {
      img.removeEventListener("load", onLoad)
      img.removeEventListener("error", onError)
    }
  }, [previewHref])

  useEffect(() => {
    if (!imageUrlPopperAnchor) return
    setUrlDraft(parseCssUrl(backgroundImage) ?? "")
  }, [imageUrlPopperAnchor, backgroundImage])

  useEffect(() => {
    if (!imageUrlPopperAnchor) return
    const onDocMouseDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (imageUrlPopperAnchor.contains(target)) return
      if (imageUrlPopperPaperRef.current?.contains(target)) return
      setImageUrlPopperAnchor(null)
    }
    document.addEventListener("mousedown", onDocMouseDown, true)

    return () => document.removeEventListener("mousedown", onDocMouseDown, true)
  }, [imageUrlPopperAnchor])

  const urlDisplayLabel =
    previewHref === null
      ? "No image URL"
      : previewHref.length > 28
        ? `${previewHref.slice(0, 25)}…`
        : previewHref

  const dimsDisplayLabel =
    naturalImagePx !== null && naturalImagePx.w > 0 && naturalImagePx.h > 0
      ? `${naturalImagePx.w} × ${naturalImagePx.h}`
      : previewHref
        ? "…"
        : "—"

  const retinaCheckboxEnabled =
    Boolean(previewHref) &&
    naturalImagePx !== null &&
    naturalImagePx.w > 0 &&
    naturalImagePx.h > 0

  const retinaCheckboxChecked =
    retinaCheckboxEnabled &&
    naturalImagePx !== null &&
    matchesRetinaHalfBackgroundSize(backgroundSize, naturalImagePx.w, naturalImagePx.h)

  const handleRetinaCheckboxChange = (
    _: ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    if (!naturalImagePx || naturalImagePx.w <= 0 || naturalImagePx.h <= 0) return
    if (checked) {
      onCommitBackgroundSize(`${naturalImagePx.w / 2}px ${naturalImagePx.h / 2}px`)
      return
    }
    onCommitBackgroundSize("auto")
  }

  const handleChooseImageClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    setImageUrlPopperAnchor((prev) =>
      prev === event.currentTarget ? null : event.currentTarget,
    )
  }

  const handleApplyImageUrl = () => {
    const trimmed = urlDraft.trim()
    if (!trimmed) return
    onCommitBackgroundImage(toCssUrlValue(trimmed), { urlFillDefaults: "apply" })
    setImageUrlPopperAnchor(null)
  }

  const handleFillKindChange = (id: string) => {
    const next = id as BackgroundFillKind
    if (next === "url") {
      const href = parseCssUrl(backgroundImage)
      if (!href && !backgroundImage?.trim()) return
      onCommitBackgroundImage(href ? toCssUrlValue(href) : undefined, {
        urlFillDefaults: "apply",
      })
      return
    }
    if (next === "linear-gradient") {
      onCommitBackgroundImage(DEFAULT_LINEAR_GRADIENT, { urlFillDefaults: "clear" })
      return
    }
    if (next === "radial-gradient") {
      onCommitBackgroundImage(DEFAULT_RADIAL_GRADIENT, { urlFillDefaults: "clear" })
      return
    }
    if (next === "overlay") {
      onCommitBackgroundImage(DEFAULT_OVERLAY_LINEAR, { urlFillDefaults: "clear" })
    }
  }

  const iconFill = COLORS.purple400

  const normalizedBackgroundRepeat =
    typeof backgroundRepeat === "string" ? backgroundRepeat.trim() : undefined
  const repeatButtonGroupValue =
    normalizedBackgroundRepeat === "repeat" ||
    normalizedBackgroundRepeat === "repeat-x" ||
    normalizedBackgroundRepeat === "repeat-y" ||
    normalizedBackgroundRepeat === "no-repeat"
      ? normalizedBackgroundRepeat
      : undefined

  const normalizedBackgroundAttachment =
    typeof backgroundAttachment === "string" ? backgroundAttachment.trim() : undefined
  const attachmentButtonGroupValue =
    normalizedBackgroundAttachment === "fixed" || normalizedBackgroundAttachment === "scroll"
      ? normalizedBackgroundAttachment
      : undefined

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
      style={{ zIndex: 4000 }}
    >
      <ImageGradientMenuPaper ref={popperRef} elevation={0}>
        <ImageGradientMenuSection>
          <CraftSettingsButtonGroup
            label="Type"
            value={fillKind}
            onChange={handleFillKindChange}
            disableResetPopperPortal
            options={[
              { id: "url", content: <AssetsIcon size={16} fill={iconFill}/> },
              { id: "linear-gradient", content: <GradientRoundedIcon size={16} fill={iconFill}/> },
              { id: "radial-gradient", content: <RadialGradientIcon size={16} fill={iconFill}/> },
              { id: "overlay", content: <OverlayRoundedIcon size={16} fill={iconFill}/> },
            ]}
          />
        </ImageGradientMenuSection>

        {fillKind === "url" ? (
          <>
            <ImageGradientMenuSectionDense>
              <MenuRowSpread>
                <MenuRowLabel>Image</MenuRowLabel>
                <Box sx={{ display: "flex", gap: "12px", flex: 1, minWidth: 0 }}>
                  <ImagePreviewFrame>
                    {previewHref ? (
                      <Box
                        component="img"
                        src={previewHref}
                        alt=""
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <ImageTransparencyCheckerboard aria-hidden/>
                    )}
                  </ImagePreviewFrame>
                  <ImageMetaColumn>
                    <Typography
                      sx={{
                        fontSize: "10px",
                        lineHeight: "14px",
                        letterSpacing: "0.015em",
                        color: COLORS.gray700,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {urlDisplayLabel}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "10px",
                        lineHeight: "14px",
                        letterSpacing: "0.015em",
                        color: COLORS.gray700,
                      }}
                    >
                      {dimsDisplayLabel}
                    </Typography>
                    <PixelHintRow>
                      <PixelDensityCheckbox
                        size="small"
                        disabled={!retinaCheckboxEnabled}
                        checked={retinaCheckboxChecked}
                        onChange={handleRetinaCheckboxChange}
                        inputProps={{ "aria-label": "@2x background density" }}
                      />
                      <PixelDensityLabel>@2x</PixelDensityLabel>
                    </PixelHintRow>
                  </ImageMetaColumn>
                </Box>
              </MenuRowSpread>
              <ChooseImageButtonRow>
                <ChooseImageTriggerButton type="button" onClick={handleChooseImageClick}>
                  <Typography
                    sx={{
                      fontSize: "10px",
                      lineHeight: "14px",
                      color: COLORS.black,
                    }}
                  >
                    Choose image
                  </Typography>
                </ChooseImageTriggerButton>
                <Popper
                  open={Boolean(imageUrlPopperAnchor)}
                  anchorEl={imageUrlPopperAnchor}
                  placement="left-start"
                  disablePortal
                  modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
                  style={{ zIndex: 4001 }}
                >
                  <ImageUrlEntryPaper ref={imageUrlPopperPaperRef} elevation={0}>
                    <ImageUrlEntryField
                      size="small"
                      fullWidth
                      placeholder="https://…"
                      value={urlDraft}
                      onChange={(e) => setUrlDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleApplyImageUrl()
                        }
                      }}
                      variant="outlined"
                    />
                    <ImageUrlEntryActionsRow>
                      <ImageUrlEntryButton
                        type="button"
                        onClick={() => setImageUrlPopperAnchor(null)}
                      >
                        Cancel
                      </ImageUrlEntryButton>
                      <ImageUrlEntryPrimaryButton type="button" onClick={handleApplyImageUrl}>
                        Apply
                      </ImageUrlEntryPrimaryButton>
                    </ImageUrlEntryActionsRow>
                  </ImageUrlEntryPaper>
                </Popper>
              </ChooseImageButtonRow>
            </ImageGradientMenuSectionDense>

            <ImageGradientMenuSectionDense>
              <CraftSettingsButtonGroup
                label="Size"
                value={backgroundSizeMode}
                onChange={handleBackgroundSizeModeChange}
                disableResetPopperPortal
                options={[
                  { id: "custom", content: "Custom" },
                  { id: "cover", content: "Cover" },
                  { id: "contain", content: "Contain" },
                ]}
              />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gridTemplateRows: "auto auto",
                  columnGap: "8px",
                  rowGap: "2px",
                  width: "100%",
                  boxSizing: "border-box",
                  paddingLeft: "56px",
                }}
              >
                <Box
                  sx={{
                    gridColumn: 1,
                    gridRow: 1,
                    minWidth: 0,
                    width: "100%",
                  }}
                >
                  <CraftSettingsValueWithUnit
                    label="Width"
                    withoutLabel
                    disableUnitPopperPortal
                    unitAffixVariant="mutedLowercase"
                    value={sizeDims.w}
                    onCommit={handleBackgroundWidthCommit}
                    mode="web"
                    placeholder="Auto"
                    inputWidth="100%"
                    customWidth="100%"
                    disabled={customSizeInputsDisabled}
                  />
                </Box>
                <Box
                  sx={{
                    gridColumn: 2,
                    gridRow: 1,
                    minWidth: 0,
                    width: "100%",
                  }}
                >
                  <CraftSettingsValueWithUnit
                    label="Height"
                    withoutLabel
                    disableUnitPopperPortal
                    allowedUnits={BACKGROUND_SIZE_UNIT_MENU}
                    unitAffixVariant="mutedLowercase"
                    value={sizeDims.h}
                    onCommit={handleBackgroundHeightCommit}
                    mode="web"
                    placeholder="Auto"
                    inputWidth="100%"
                    customWidth="100%"
                    disabled={customSizeInputsDisabled}
                  />
                </Box>
                <Box
                  sx={{
                    gridColumn: 1,
                    gridRow: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    rowGap: "2px",
                  }}
                >
                  <UnitFieldCaption>Width</UnitFieldCaption>
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
                  <UnitFieldCaption>Height</UnitFieldCaption>
                </Box>
              </Box>
            </ImageGradientMenuSectionDense>

            <ImageGradientMenuSectionDense>
              <MenuRow>
                <MenuRowLabel sx={{ alignSelf: "start" }}>Position</MenuRowLabel>
                <PositionBlock>
                  <BackgroundPositionNineGrid
                    backgroundPosition={backgroundPosition}
                    onCommit={onCommitBackgroundPosition}
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
                          onCommit={handleBackgroundPositionXCommit}
                          mode="web"
                          placeholder="0"
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
                          onCommit={handleBackgroundPositionYCommit}
                          mode="web"
                          placeholder="0"
                          inputWidth="100%"
                          customWidth="100%"
                        />
                      </Box>
                    </InsetAxisRow>
                  </PositionInputsColumn>
                </PositionBlock>
              </MenuRow>
            </ImageGradientMenuSectionDense>

            <ImageGradientMenuFooterSection>
              <CraftSettingsButtonGroup
                label="Repeat"
                value={repeatButtonGroupValue}
                onChange={onCommitBackgroundRepeat}
                onReset={() => {
                  onCommitBackgroundRepeat(undefined)
                }}
                disableResetPopperPortal
                options={[
                  { id: "repeat", content: <AppsIcon size={16} fill={iconFill}/> },
                  { id: "repeat-x", content: <TileIcon size={16} fill={iconFill}/> },
                  {
                    id: "repeat-y",
                    content: <Box sx={{ display: "inline-flex", transform: "rotate(90deg)" }}>
                      <MoreHorizontalIcon size={16} fill={iconFill}/>
                    </Box>,
                  },
                  { id: "no-repeat", content: <CloseIcon size={12} fill={iconFill}/> },
                ]}
              />
              <CraftSettingsButtonGroup
                label="Fixed"
                value={attachmentButtonGroupValue}
                onChange={onCommitBackgroundAttachment}
                onReset={() => {
                  onCommitBackgroundAttachment(undefined)
                }}
                disableResetPopperPortal
                options={[
                  { id: "fixed", content: "Fixed" },
                  { id: "scroll", content: "Not fixed" },
                ]}
              />
            </ImageGradientMenuFooterSection>
          </>
        ) : null}
      </ImageGradientMenuPaper>
    </Popper>
  )
}
