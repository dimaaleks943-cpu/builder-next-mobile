import { useMemo, useRef, useState, useCallback } from "react"
import { useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { InlineSettingsModal } from "../components/InlineSettingsModal.tsx"
import { ImageSettingsFields } from "../pages/builder/settingsCraftComponents/ImageSettingsFields.tsx"
import { useRightPanelContext } from "../pages/builder/context/RightPanelContext.tsx"
import {
  useReactToInlineSettingsOpenRequest,
  type InlineSettingsViewportAnchor,
} from "../pages/builder/context/CraftInlineSettingsBridgeContext.tsx"
import { COLORS } from "../theme/colors"
import { useContentListData } from "../pages/builder/context/ContentListDataContext.tsx"
import { CRAFT_DISPLAY_NAME } from "./craftDisplayNames.ts"
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
  const collectionField = props.collectionField ?? null
  const backgroundColor = responsiveStyle.backgroundColor as string | undefined

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

  useReactToInlineSettingsOpenRequest(imageNodeId, openImageInlineSettings)

  const handleShowAllSettings = () => {
    rightPanelContext?.setTabIndex(1)
    setIsSettingsOpen(false)
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

    // Плейсхолдер по умолчанию.
    return "https://cdn-icons-png.flaticon.com/128/17807/17807769.png"
  }, [collectionField, contentListData?.itemData, src])

  const style: CSSProperties = {
    ...(responsiveStyle as CSSProperties),
    display: "block",
    width: width ?? "100%",
    height: height ?? "auto",
    minWidth,
    minHeight: minHeight ?? height ?? 140,
    maxWidth,
    maxHeight,
    overflow,
    boxSizing: "border-box",
    backgroundColor: backgroundColor ?? COLORS.gray100,
  }

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
        <img src={effectiveSrc} alt={alt} style={style}/>
      </div>
      <InlineSettingsModal
        open={isSettingsOpen}
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
      },
    },
  },
}

