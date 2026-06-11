import { useMemo, useRef, useState, useCallback } from "react"
import { useNode } from "@craftjs/core"
import { ImageSettingsFields } from "../pages/builder/settingsCraftComponents/ImageSettingsFields/ImageSettingsFields.tsx"
import { useRightPanelContext } from "../pages/builder/context/RightPanelContext.tsx"
import {
  useCraftInlineSettingsBridge,
  useReactToInlineSettingsOpenRequest,
  type InlineSettingsViewportAnchor,
} from "../pages/builder/context/CraftInlineSettingsBridgeContext.tsx"
import { useContentListData } from "../pages/builder/context/ContentListDataContext.tsx"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
import { PreviewViewport } from "../pages/builder/builder.enum.ts"
import { useCraftNodeStyle } from "../pages/builder/hooks/useCraftNodeStyle.ts"
import type { ResponsiveStyle } from "../pages/builder/responsiveStyle.ts"
import backgroundImage from "../assets/background-image.svg"
import { InlineSettingsModal } from "../components/InlineSettingsModal/InlineSettingsModal.tsx";

export interface CraftImageProps {
  src?: string
  alt?: string
  /** Поле коллекции, содержащее URL изображения (если компонент внутри ContentList). */
  collectionField?: string | null
  styleClassIds?: string[]
  style?: ResponsiveStyle
}

export const CraftImage = (props: CraftImageProps) => {
  const responsiveStyle = useCraftNodeStyle(props.styleClassIds, props.style)
  const src = props.src
  const alt = props.alt ?? "Изображение"
  const collectionField = props.collectionField ?? null

  const {
    connectors: { connect, drag },
    id: imageNodeId,
  } = useNode((node) => ({
    id: node.id,
  }))

  const contentListData = useContentListData()
  const imageWrapperRef = useRef<HTMLDivElement | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
  const rightPanelContext = useRightPanelContext()

  const openImageInlineSettings = useCallback(
    (viewportAnchor: InlineSettingsViewportAnchor | null) => {
      if (viewportAnchor) {
        setModalPosition({
          top: viewportAnchor.top,
          left: viewportAnchor.left,
        })
      } else if (imageWrapperRef.current) {
        const rect = imageWrapperRef.current.getBoundingClientRect()
        setModalPosition({ top: rect.bottom + 6, left: rect.left })
      }
      setIsSettingsOpen(true)
    },
    [],
  )

  const { clearInlineSettingsRequest } = useCraftInlineSettingsBridge()

  const closeImageInlineSettings = useCallback(() => {
    setIsSettingsOpen(false)
    clearInlineSettingsRequest()
  }, [clearInlineSettingsRequest])

  useReactToInlineSettingsOpenRequest(imageNodeId, openImageInlineSettings)

  const handleShowAllSettings = () => {
    rightPanelContext?.setTabIndex(1)
    closeImageInlineSettings()
  }

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

    return backgroundImage
  }, [collectionField, contentListData?.itemData, src])

  return (
    <>
      <div
        ref={(ref) => {
          imageWrapperRef.current = ref
          if (!ref) return
          connect(drag(ref))
        }}
        style={{ position: "relative", width: "max-content", height: "max-content" }}
      >
        <img src={effectiveSrc} alt={alt} style={{...responsiveStyle}}/>
      </div>
      <InlineSettingsModal
        open={isSettingsOpen}
        title="Настройки изображения"
        top={modalPosition.top}
        left={modalPosition.left}
        onClose={closeImageInlineSettings}
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
      },
    },
  },
}

