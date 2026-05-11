import { Popper, type PopperProps } from "@mui/material"
import debounce from "lodash/debounce"
import type { Ref } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { COLORS } from "../../../../../theme/colors.ts"
import { AssetsIcon } from "../../../../../icons/AssetsIcon.tsx"
import { GradientRoundedIcon } from "../../../../../icons/GradientRoundedIcon.tsx"
import { OverlayRoundedIcon } from "../../../../../icons/OverlayRoundedIcon.tsx"
import { RadialGradientIcon } from "../../../../../icons/RadialGradientIcon.tsx"
import { CraftSettingsButtonGroup } from "../../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsColorField } from "../../../components/craftSettingsControls/CraftSettingsColorField.tsx"
import {
  ImageGradientMenuPaper,
  ImageGradientMenuSection,
  ImageGradientMenuSectionDense,
} from "./ImageGradientMenuPopper.styles.ts"
import { LinearGradientEditorSection } from "./LinearGradientEditorSection.tsx"
import { RadialGradientEditorSection } from "./RadialGradientEditorSection.tsx"
import { UrlFillEditorSection } from "./UrlFillEditorSection.tsx"
import {
  type BackgroundFillKind,
  buildUniformOverlayBackgroundImage,
  DEFAULT_OVERLAY_BACKGROUND_IMAGE,
  DEFAULT_PLACEHOLDER_BACKGROUND_IMAGE_URL,
  inferBackgroundFillKind,
  parseCssUrl,
  parseOverlayGradientUiState,
  toCssBackgroundUrlValue,
} from "../utils/backgroundImageLayersUtils.ts"


const DEFAULT_LINEAR_GRADIENT = "linear-gradient(black, white)"

const DEFAULT_RADIAL_GRADIENT = "radial-gradient(circle, black, white)"

const OVERLAY_COLOR_COMMIT_DEBOUNCE_MS = 120

/** Стабильная ссылка: иначе MUI Popper пересоздаёт Popper.js на каждом рендере и позиция может сбрасываться в (0,0). */
const imageGradientPopperModifiers = [
  { name: "offset", options: { offset: [0, 6] } },
  { name: "flip", enabled: false },
]

export type BackgroundImageCommitOptions = {
  urlFillDefaults?: "apply" | "clear"
}

interface Props {
  open: boolean
  anchorEl: PopperProps["anchorEl"]
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
  const fillKind = inferBackgroundFillKind(backgroundImage)

  const overlayAlphaRef = useRef(0.5)
  const onCommitBackgroundImageRef = useRef(onCommitBackgroundImage)
  onCommitBackgroundImageRef.current = onCommitBackgroundImage

  const [overlayHexDraft, setOverlayHexDraft] = useState(() => {
    const ui = parseOverlayGradientUiState(backgroundImage)
    return ui?.hex ?? "#000000"
  })

  useEffect(() => {
    const ui = parseOverlayGradientUiState(backgroundImage)
    if (ui) overlayAlphaRef.current = ui.alpha
  }, [backgroundImage])

  useEffect(() => {
    if (fillKind !== "overlay") return
    const ui = parseOverlayGradientUiState(backgroundImage)
    setOverlayHexDraft(ui?.hex ?? "#000000")
  }, [fillKind, backgroundImage])

  const debouncedCommitOverlayColor = useMemo(
    () =>
      debounce((hex: string) => {
        const next = buildUniformOverlayBackgroundImage(hex, overlayAlphaRef.current)
        if (!next) return
        onCommitBackgroundImageRef.current(next, { urlFillDefaults: "clear" })
      }, OVERLAY_COLOR_COMMIT_DEBOUNCE_MS),
    [],
  )

  useEffect(
    () => () => debouncedCommitOverlayColor.cancel(),
    [debouncedCommitOverlayColor],
  )

  useEffect(() => {
    if (!open) {
      debouncedCommitOverlayColor.flush()
    }
  }, [open, debouncedCommitOverlayColor])

  const handleOverlayColorChange = (value: string) => {
    setOverlayHexDraft(value)
    debouncedCommitOverlayColor(value)
  }

  const handleFillKindChange = (id: string) => {
    const next = id as BackgroundFillKind
    if (next === "url") {
      const href = parseCssUrl(backgroundImage)
      onCommitBackgroundImage(
        toCssBackgroundUrlValue(href ?? DEFAULT_PLACEHOLDER_BACKGROUND_IMAGE_URL),
        { urlFillDefaults: "apply" },
      )
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
      onCommitBackgroundImage(DEFAULT_OVERLAY_BACKGROUND_IMAGE, {
        urlFillDefaults: "clear",
      })
    }
  }

  const iconFill = COLORS.purple400

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      modifiers={imageGradientPopperModifiers}
      style={{ zIndex: 4000 }}
    >
      <ImageGradientMenuPaper
        ref={popperRef}
        elevation={0}
        data-bg-gradient-popper=""
      >
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

        {fillKind === "linear-gradient" ? (
          <LinearGradientEditorSection
            backgroundImage={backgroundImage}
            onCommitBackgroundImage={onCommitBackgroundImage}
          />
        ) : null}

        {fillKind === "radial-gradient" ? (
          <RadialGradientEditorSection
            backgroundImage={backgroundImage}
            onCommitBackgroundImage={onCommitBackgroundImage}
          />
        ) : null}

        {fillKind === "overlay" ? (
          <ImageGradientMenuSectionDense>
            <CraftSettingsColorField
              label="Color"
              value={overlayHexDraft}
              onChange={handleOverlayColorChange}
              disableResetPopperPortal
            />
          </ImageGradientMenuSectionDense>
        ) : null}

        {fillKind === "url" ? (
          <UrlFillEditorSection
            backgroundImage={backgroundImage}
            backgroundSize={backgroundSize}
            backgroundPosition={backgroundPosition}
            backgroundRepeat={backgroundRepeat}
            backgroundAttachment={backgroundAttachment}
            onCommitBackgroundImage={onCommitBackgroundImage}
            onCommitBackgroundSize={onCommitBackgroundSize}
            onCommitBackgroundPosition={onCommitBackgroundPosition}
            onCommitBackgroundRepeat={onCommitBackgroundRepeat}
            onCommitBackgroundAttachment={onCommitBackgroundAttachment}
          />
        ) : null}
      </ImageGradientMenuPaper>
    </Popper>
  )
}
