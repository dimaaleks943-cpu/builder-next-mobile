import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useEditor, useNode } from "@craftjs/core"
import type { CSSProperties } from "react"
import { COLORS } from "../theme/colors"
import { InlineSettingsModal } from "./InlineSettingsModal"
import { InlineSettingsBadge } from "./InlineSettingsBadge"
import { useInsideContentListCell } from "./ContentListCellContext"
import { useContentListData } from "./ContentListDataContext"
import { useCollectionsContext } from "../pages/builder/CollectionsContext"

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
    id,
  } = useNode((node) => ({
    selected: node.events.selected,
    id: node.id,
  }))
  const { actions } = useEditor()
  const isInsideContentList = useInsideContentListCell()
  const contentListData = useContentListData()
  const collectionsContext = useCollectionsContext()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
  const badgeRef = useRef<HTMLDivElement | null>(null)
  const [savedCollectionField, setSavedCollectionField] = useState<string | null>(
    collectionField,
  )
  const [urlDraft, setUrlDraft] = useState(src ?? "")

  // Обновляем сохранённое поле коллекции, когда prop меняется на ненулевое значение.
  useEffect(() => {
    if (collectionField) setSavedCollectionField(collectionField)
  }, [collectionField])

  // Получаем список полей коллекции (как в Text), когда изображение внутри ContentList.
  const collectionFields = useMemo(() => {
    if (!contentListData?.collectionKey || !collectionsContext) {
      return []
    }
    const collection = collectionsContext.collections.find(
      (c) => c.key === contentListData.collectionKey,
    )
    if (!collection || !collection.items || collection.items.length === 0) {
      return []
    }
    const firstItem = collection.items[0]
    if (!firstItem || typeof firstItem !== "object") {
      return []
    }
    return Object.keys(firstItem).filter((key) => {
      const value = firstItem[key]
      return typeof value !== "function"
    })
  }, [contentListData?.collectionKey, collectionsContext])

  const isCollectionAvailable =
    isInsideContentList && collectionFields.length > 0

  const inputMode: "manual" | "collection" =
    isCollectionAvailable && collectionField ? "collection" : "manual"

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
    const manualSrc = src ?? urlDraft
    if (manualSrc && manualSrc.trim().length > 0) {
      return manualSrc
    }

    // Плейсхолдер по умолчанию.
    return "https://cdn-icons-png.flaticon.com/128/17807/17807769.png"
  }, [collectionField, contentListData?.itemData, src, urlDraft])

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

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setUrlDraft(value)
    if (!id) return
    actions.setProp(id, (props: any) => {
      props.src = value
      // При ручном вводе URL сбрасываем привязку к коллекции
      props.collectionField = null
    })
  }

  const handleCollectionFieldChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = event.target.value || null
    if (!id) return
    actions.setProp(id, (props: any) => {
      props.collectionField = value
    })
  }

  const handleModeSwitch = (mode: "manual" | "collection") => {
    if (!id) return
    actions.setProp(id, (props: any) => {
      if (mode === "manual") {
        props.collectionField = null
      } else {
        if (!isCollectionAvailable) {
          return
        }

        if (!props.collectionField) {
          let nextField: string | null = null

          if (
            savedCollectionField &&
            collectionFields.includes(savedCollectionField)
          ) {
            nextField = savedCollectionField
          } else if (collectionFields.length > 0) {
            nextField = collectionFields[0]
          }

          props.collectionField = nextField
        }
      }
    })
  }

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
      >
        {/* Переключатель режимов (ручной URL / поле коллекции) */}
        {isCollectionAvailable && (
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 12,
              backgroundColor: COLORS.gray100,
              padding: 4,
              borderRadius: 4,
            }}
          >
            <button
              type="button"
              onClick={() => handleModeSwitch("manual")}
              style={{
                flex: 1,
                padding: "6px 8px",
                border: "none",
                borderRadius: 4,
                backgroundColor:
                  inputMode === "manual" ? COLORS.white : "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: 12,
                color:
                  inputMode === "manual" ? COLORS.gray800 : COLORS.gray600,
                boxShadow:
                  inputMode === "manual"
                    ? "0 1px 2px rgba(0,0,0,0.1)"
                    : "none",
              }}
            >
              <span>🔗</span>
              <span>Manual</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch("collection")}
              style={{
                flex: 1,
                padding: "6px 8px",
                border: "none",
                borderRadius: 4,
                backgroundColor:
                  inputMode === "collection" ? COLORS.white : "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: 12,
                color:
                  inputMode === "collection"
                    ? COLORS.gray800
                    : COLORS.gray600,
                boxShadow:
                  inputMode === "collection"
                    ? "0 1px 2px rgba(0,0,0,0.1)"
                    : "none",
              }}
            >
              <span>🗄️</span>
              <span>Collection</span>
            </button>
          </div>
        )}

        {/* Ручной URL (доступен всегда) */}
        {(inputMode === "manual" || !isCollectionAvailable) && (
          <>
            <label
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: 12,
                color: COLORS.gray700,
              }}
            >
              URL изображения
            </label>
            <input
              type="text"
              value={urlDraft}
              onChange={handleUrlChange}
              placeholder="https://..."
              style={{
                width: "100%",
                padding: "6px 8px",
                fontSize: 13,
                borderRadius: 4,
                border: `1px solid ${COLORS.gray300}`,
                backgroundColor: COLORS.white,
                boxSizing: "border-box",
              }}
            />
          </>
        )}

        {/* Привязка к полю коллекции (доступно только внутри ContentList) */}
        {inputMode === "collection" && isCollectionAvailable && (
          <>
            <label
              style={{
                display: "block",
                marginTop: 8,
                marginBottom: 4,
                fontSize: 12,
                color: COLORS.gray700,
              }}
            >
              Поле коллекции (URL изображения)
            </label>
            <select
              value={collectionField || ""}
              onChange={handleCollectionFieldChange}
              style={{
                width: "100%",
                padding: "6px 8px",
                fontSize: 13,
                borderRadius: 4,
                border: `1px solid ${COLORS.gray300}`,
                backgroundColor: COLORS.white,
                boxSizing: "border-box",
              }}
            >
              <option value="">Select field...</option>
              {collectionFields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </>
        )}
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

