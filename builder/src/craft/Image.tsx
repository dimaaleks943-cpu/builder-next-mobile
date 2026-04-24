import { useCallback, useMemo, useRef, useState } from "react"
import { useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { COLORS } from "../theme/colors"
import { withOpacity } from "../utils/colorUtils"
import { InlineSettingsModal } from "../components/InlineSettingsModal.tsx"
import { InlineSettingsBadge } from "../components/InlineSettingsBadge.tsx"
import { useContentListData } from "../pages/builder/context/ContentListDataContext.tsx"
import { useRightPanelContext } from "../pages/builder/context/RightPanelContext.tsx"
import { ImageSettingsFields } from "../pages/builder/settingsCraftComponents"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import {
  type CraftMixBlendMode,
  DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  resolveCraftVisualEffectsStyle,
} from "./craftVisualEffects.ts"
import { usePreviewViewport } from "../pages/builder/context/PreviewViewportContext.tsx"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"
import { resolveResponsiveStyle, type ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"

export interface CraftImageProps {
  src?: string
  alt?: string
  /** Поле коллекции, содержащее URL изображения (если компонент внутри ContentList). */
  collectionField?: string | null
  style?: ResponsiveStyle
}

export const CraftImage = (props: CraftImageProps) => {
  const viewport = usePreviewViewport()
  const responsiveStyle = resolveResponsiveStyle(props.style, viewport)
  const src = props.src
  const alt = props.alt ?? "Изображение"
  //TODO реафктор стилей после подключения работы с коллекцией
  const width = responsiveStyle.width as string | number | undefined
  const height = responsiveStyle.height as string | number | undefined
  const minWidth = responsiveStyle.minWidth as number | undefined
  const minHeight = responsiveStyle.minHeight as number | undefined
  const maxWidth = responsiveStyle.maxWidth as string | number | undefined
  const maxHeight = responsiveStyle.maxHeight as string | number | undefined
  const overflow = responsiveStyle.overflow as "auto" | "hidden" | "visible" | "scroll" | undefined
  const borderRadius = (responsiveStyle.borderRadius as number | undefined) ?? 0
  const borderTopWidth = (responsiveStyle.borderTopWidth as number | undefined) ?? 0
  const borderRightWidth = (responsiveStyle.borderRightWidth as number | undefined) ?? 0
  const borderBottomWidth = (responsiveStyle.borderBottomWidth as number | undefined) ?? 0
  const borderLeftWidth = (responsiveStyle.borderLeftWidth as number | undefined) ?? 0
  const borderColor = (responsiveStyle.borderColor as string | undefined) ?? COLORS.gray400
  const borderStyle =
    (responsiveStyle.borderStyle as "none" | "solid" | "dotted" | "dashed" | undefined) ?? "solid"
  const borderOpacity = (responsiveStyle.borderOpacity as number | undefined) ?? 1
  const collectionField = props.collectionField ?? null
  const backgroundColor = responsiveStyle.backgroundColor as string | undefined
  const mixBlendMode =
    (responsiveStyle.mixBlendMode as CraftMixBlendMode | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.mixBlendMode
  const opacityPercent =
    (responsiveStyle.opacityPercent as number | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.opacityPercent
  const outlineStyleMode =
    (responsiveStyle.outlineStyleMode as (typeof DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS)["outlineStyleMode"]) ??
    DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineStyleMode
  const outlineWidth =
    (responsiveStyle.outlineWidth as number | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineWidth
  const outlineOffset =
    (responsiveStyle.outlineOffset as number | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineOffset
  const outlineColor =
    (responsiveStyle.outlineColor as string | undefined) ?? DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineColor
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((node) => ({
    selected: node.events.selected,
    id: node.id,
  }))
  const contentListData = useContentListData()
  const rightPanelContext = useRightPanelContext()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
  const badgeRef = useRef<HTMLDivElement | null>(null)
  const imageWrapperRef = useRef<HTMLDivElement | null>(null)

  const effectiveSrc = useMemo(() => {
    // Если есть выбранное поле коллекции и данные элемента — берём URL из коллекции.
    // if (collectionField && contentListData?.itemData) { TODO тип данных как img пока отстутсвует в колеекции
    //   const item = contentListData.itemData as IContentItem
    //   const field = findContentItemField(item, collectionField)
    //   const url = getContentFieldImageUrl(field)
    //   if (url) return url
    // }

    // Иначе используем вручную заданный URL.
    const manualSrc = src
    if (manualSrc && manualSrc.trim().length > 0) {
      return manualSrc
    }

    // Плейсхолдер по умолчанию.
    return "https://cdn-icons-png.flaticon.com/128/17807/17807769.png"
  }, [collectionField, contentListData?.itemData, src])

  const handleShowAllSettings = () => {
    rightPanelContext?.setTabIndex(1)
    setIsSettingsOpen(false)
  }

  const hasCustomBorder =
    borderTopWidth > 0 ||
    borderRightWidth > 0 ||
    borderBottomWidth > 0 ||
    borderLeftWidth > 0

  const effectiveBorderColor = hasCustomBorder
    ? withOpacity(borderColor, borderOpacity)
    : "transparent"

  const style: CSSProperties = {
    display: "block",
    width: width ?? "100%",
    height: height ?? "auto",
    minWidth,
    minHeight: minHeight ?? height ?? 140,
    maxWidth,
    maxHeight,
    overflow,
    objectFit: "cover",
    borderRadius,
    boxSizing: "border-box",
    borderStyle: selected ? "solid" : hasCustomBorder ? (borderStyle || "solid") : "solid",
    borderColor: selected ? COLORS.purple400 : effectiveBorderColor,
    borderTopWidth: selected ? 2 : hasCustomBorder ? borderTopWidth : 0,
    borderRightWidth: selected ? 2 : hasCustomBorder ? borderRightWidth : 0,
    borderBottomWidth: selected ? 2 : hasCustomBorder ? borderBottomWidth : 0,
    borderLeftWidth: selected ? 2 : hasCustomBorder ? borderLeftWidth : 0,
    backgroundColor: backgroundColor ?? COLORS.gray100,
    ...resolveCraftVisualEffectsStyle({
      mixBlendMode,
      opacityPercent,
      outlineStyleMode,
      outlineWidth,
      outlineOffset,
      outlineColor,
    }),
  }

  const openSettings = useCallback(
    (event?: React.MouseEvent | React.PointerEvent) => {
      if (event && "stopPropagation" in event) {
        event.stopPropagation()
        event.preventDefault()
      }
      if (badgeRef.current) {
        const rect = badgeRef.current.getBoundingClientRect()
        setModalPosition({
          top: rect.bottom + 6,
          left: rect.left,
        })
      }
      setIsSettingsOpen(true)
    },
    [],
  )

  // Локальной логики настроек (URL/режим/размеры) здесь больше нет —
  // всё вынесено в общий компонент ImageSettingsFields, который
  // используется как в модалке, так и в правой панели.

  return (
    <>
      <div
        ref={(ref) => {
          imageWrapperRef.current = ref
          if (!ref) return
          connect(drag(ref))
        }}
        style={{ position: "relative" }}
      >
        {/* Бирка Image — показывается всегда при выделении компонента */}
        {selected && (
          <InlineSettingsBadge
            ref={badgeRef}
            icon={<span style={{ fontSize: 11 }}>🖼</span>}
            label="Изображение"
            anchorElement={imageWrapperRef.current}
            usePortal
            onSettingsClick={() => openSettings()}
          />
        )}

        {/* Пустышка изображения: пока без настроек, только базовый placeholder */}
        <img src={effectiveSrc} alt={alt} style={style}/>
      </div>

      <InlineSettingsModal
        open={selected && isSettingsOpen}
        title="Настройки изображения"
        top={modalPosition.top}
        left={modalPosition.left}
        onClose={() => setIsSettingsOpen(false)}
        onShowAllSettings={handleShowAllSettings}
      >
        <ImageSettingsFields />
      </InlineSettingsModal>
    </>
  )
};

;(CraftImage as any).craft = {
  displayName: CRAFT_DISPLAY_NAME.Image,
  props: {
    src: undefined,
    alt: "",
    collectionField: null,
    style: {
      [PreviewViewport.DESKTOP]: {
        borderRadius: 8,
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderColor: COLORS.gray400,
        borderStyle: "solid" as const,
        borderOpacity: 1,
        ...DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
      },
    },
  },
}

