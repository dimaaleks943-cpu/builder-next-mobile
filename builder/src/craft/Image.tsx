import { useCallback, useMemo, useRef, useState } from "react"
import { useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { COLORS } from "../theme/colors"
import { InlineSettingsModal } from "../components/InlineSettingsModal.tsx"
import { InlineSettingsBadge } from "../components/InlineSettingsBadge.tsx"
import { useContentListData } from "../pages/builder/context/ContentListDataContext.tsx"
import { useRightPanelContext } from "../pages/builder/context/RightPanelContext.tsx"
import { ImageSettingsFields } from "../pages/builder/settingsCraftComponents"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import {
  DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  resolveCraftVisualEffectsStyle,
  type CraftVisualEffectsProps,
} from "./craftVisualEffects.ts"

interface Props extends CraftVisualEffectsProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  /** Поле коллекции, содержащее URL изображения (если компонент внутри ContentList). */
  collectionField?: string | null;
  backgroundColor?: string;
  /** Зарезервировано под будущий UI; в рендере пока не используется */
  backgroundClip?: string;
}

export const CraftImage = ({
  src,
  alt = "Изображение",
  width,
  height,
  borderRadius = 8,
  collectionField = null,
  backgroundColor,
  backgroundClip: _backgroundClip,
  mixBlendMode = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.mixBlendMode,
  opacityPercent = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.opacityPercent,
  outlineStyleMode = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineStyleMode,
  outlineWidth = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineWidth,
  outlineOffset = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineOffset,
  outlineColor = DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS.outlineColor,
}: Props) => {
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

  const style: CSSProperties = {
    display: "block",
    width: width ?? "100%",
    height: height ?? "auto",
    minHeight: height ?? 140,
    objectFit: "cover",
    borderRadius,
    boxSizing: "border-box",
    border: selected ? `2px solid ${COLORS.purple400}` : "1px solid transparent",
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
        style={{ width: "100%", position: "relative" }}
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
    width: undefined,
    height: undefined,
    borderRadius: 8,
    collectionField: null,
    backgroundColor: undefined,
    backgroundClip: undefined,
    ...DEFAULT_CRAFT_VISUAL_EFFECTS_PROPS,
  },
}

