import { useCallback, useMemo, useRef, useState } from "react"
import { useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { COLORS } from "../theme/colors"
import { InlineSettingsModal } from "./InlineSettingsModal"
import { InlineSettingsBadge } from "./InlineSettingsBadge"
import { useContentListData } from "./ContentListDataContext"
import { useRightPanelContext } from "../pages/builder/RightPanelContext"
import { ImageSettingsFields } from "../pages/builder/settingsCraftComponents/ImageSettingsFields.tsx"

interface Props {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  /** Поле коллекции, содержащее URL изображения (если компонент внутри ContentList). */
  collectionField?: string | null;
}

export const Image = ({
  src,
  alt = "Изображение",
  width,
  height,
  borderRadius = 8,
  collectionField = null,
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

  const effectiveSrc = useMemo(() => {
    // Если есть выбранное поле коллекции и данные элемента — берём URL из коллекции.
    if (collectionField && contentListData?.itemData) {
      const fieldValue = contentListData.itemData[collectionField]
      if (fieldValue !== null && fieldValue !== undefined) {
        if (typeof fieldValue === "string") {
          return fieldValue
        }

        if (typeof fieldValue === "object") {
          // ВРЕМЕННАЯ ЗАГЛУШКА:
          // Сейчас поле image в коллекции приходит как объект:
          // {
          //   urls: {
          //     original: { url: "...", auth: false },
          //     small:    { url: "...", auth: false }
          //   },
          //   sort: null
          // }
          // Пока просто пытаемся вытащить small/original.url.
          const asAny = fieldValue as any
          const fromDirectUrl = asAny.url as string | undefined
          const fromSmall = asAny.urls?.small?.url as string | undefined
          const fromOriginal = asAny.urls?.original?.url as string | undefined

          const candidate = fromDirectUrl ?? fromSmall ?? fromOriginal
          if (candidate && typeof candidate === "string") {
            return candidate
          }
        }

        // На будущее: здесь можно будет добавить более умную обработку
        // других форматов (например, массивы картинок и т.п.).
      }
    }

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
    backgroundColor: COLORS.gray100,
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

(Image as any).craft = {
  displayName: "Image",
  props: {
    src: undefined,
    alt: "",
    width: undefined,
    height: undefined,
    borderRadius: 8,
    collectionField: null,
  },
}

