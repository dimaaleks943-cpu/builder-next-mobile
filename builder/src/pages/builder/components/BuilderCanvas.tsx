import { useEffect, useRef, useState } from "react"
import { Box, IconButton } from "@mui/material"
import { Frame, Element, useEditor, type SerializedNodes } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import {
  getPreviewMaxWidth,
  MODE_TYPE, PREVIEW_WIDTH_PHONE, PREVIEW_WIDTH_PHONE_LANDSCAPE,
  PREVIEW_WIDTH_TABLET,
  PREVIEW_WIDTH_TABLET_LANDSCAPE,
  PreviewViewport
} from "../builder.enum"
import { CraftBody } from "../../../craft/Body.tsx"
import { PageType, type IContentItem } from "../../../api/extranet"
import { ContentListDataContext } from "../context/ContentListDataContext.tsx"
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts"
import { deleteCraftNode } from "../../../utils/craftDeleteNode.ts"
import { UpdateIcon } from "../../../icons/UpdateIcon"
import { MonitorIcon } from "../../../icons/MonitorIcon.tsx";
import { TabletIcon } from "../../../icons/TabletIcon.tsx";
import { MobileIcon } from "../../../icons/MobileIcon.tsx";
import { useBuilderModeContext } from "../context/BuilderModeContext.tsx";

const MIN_PREVIEW_WIDTH = 320
const MAX_WEB_PREVIEW_WIDTH = 3840
const MAX_RN_PREVIEW_WIDTH = PREVIEW_WIDTH_TABLET_LANDSCAPE

interface BuilderCanvasProps {
  initialContent: SerializedNodes | null;
  previewViewport: PreviewViewport;
  /** Метаданные страницы: для template + collection_type_id холст оборачивается в ContentListDataContext. */
  pageType: PageType;
  collectionTypeId: string | null;
  templatePreviewItem: IContentItem | null;
  onPreviewViewportChange: (viewport: PreviewViewport) => void;
}

export const BuilderCanvas = ({
  initialContent,
  previewViewport,
  pageType,
  collectionTypeId,
  templatePreviewItem,
  onPreviewViewportChange,
}: BuilderCanvasProps) => {
  const { actions, query } = useEditor()
  const modeContext = useBuilderModeContext()
  const isRn = modeContext?.mode === MODE_TYPE.RN
  const [customPreviewWidth, setCustomPreviewWidth] = useState<number | null>(null)
  const [widthInput, setWidthInput] = useState<string>(() => String(getPreviewMaxWidth(previewViewport)))
  const [isWidthInputFocused, setIsWidthInputFocused] = useState(false)
  const isApplyingCustomWidthRef = useRef(false)
  const { selectedId, canDeleteSelected } = useEditor((state, query) => {
    const [id] = Array.from(state.events.selected)
    if (!id) return { selectedId: null as string | null, canDeleteSelected: false }
    const isRootNode = query.node(id).isRoot()
    return { selectedId: id, canDeleteSelected: !isRootNode }
  })

  /**
   * Рекурсивно собираем историю вложенности предков через parent
   * и формируем breadcrumb для панели над холстом.
   */
  const { breadcrumb } = useEditor((state, query) => {
    const [selectedId] = Array.from(state.events.selected)

    if (!selectedId) {
      return { breadcrumb: [] as string[] }
    }

    const collectAncestors = (id: string, acc: string[]): string[] => {
      const node = query.node(id).get()
      if (!node) return acc

      const parentId = node.data.parent
      if (parentId && parentId !== "ROOT") {
        return collectAncestors(parentId, [parentId, ...acc])
      }
      return acc
    }

    const ancestorIds = collectAncestors(selectedId, [])
    const allIds = [...ancestorIds, selectedId]

    const names = allIds.map((id) =>
      resolveNodeDisplayName(state.nodes[id]),
    )

    return { breadcrumb: names }
  })

  const canvasRef = useRef<HTMLDivElement>(null)
  const appliedPreviewWidth = customPreviewWidth ?? getPreviewMaxWidth(previewViewport)

  const mapWidthToViewport = (width: number): PreviewViewport => {
    if (width <= PREVIEW_WIDTH_PHONE) return PreviewViewport.PHONE
    if (width <= PREVIEW_WIDTH_PHONE_LANDSCAPE) return PreviewViewport.PHONE_LANDSCAPE
    if (width <= PREVIEW_WIDTH_TABLET) return PreviewViewport.TABLET
    if (width <= PREVIEW_WIDTH_TABLET_LANDSCAPE) return PreviewViewport.TABLET_LANDSCAPE
    return isRn ? PreviewViewport.TABLET_LANDSCAPE : PreviewViewport.DESKTOP
  }

  const syncInputWithViewport = (viewport: PreviewViewport) => {
    setCustomPreviewWidth(null)
    setWidthInput(String(getPreviewMaxWidth(viewport)))
  }

  const handlePresetViewportChange = (viewport: PreviewViewport) => {
    syncInputWithViewport(viewport)
    onPreviewViewportChange(viewport)
  }

  const commitWidthInput = () => {
    if (!/^\d+$/.test(widthInput)) {
      setWidthInput(String(appliedPreviewWidth))
      return
    }

    const parsedWidth = Number(widthInput)
    const maxWidth = isRn ? MAX_RN_PREVIEW_WIDTH : MAX_WEB_PREVIEW_WIDTH
    const isValidRange = Number.isInteger(parsedWidth) && parsedWidth >= MIN_PREVIEW_WIDTH && parsedWidth <= maxWidth

    if (!isValidRange) {
      setWidthInput(String(appliedPreviewWidth))
      return
    }

    setCustomPreviewWidth(parsedWidth)
    setWidthInput(String(parsedWidth))
    isApplyingCustomWidthRef.current = true
    onPreviewViewportChange(mapWidthToViewport(parsedWidth))
  }

  useEffect(() => {
    if (selectedId && canvasRef.current) {
      canvasRef.current.focus()
    }
  }, [selectedId])

  useEffect(() => {
    if (isApplyingCustomWidthRef.current) {
      isApplyingCustomWidthRef.current = false
      return
    }

    if (!isWidthInputFocused) {
      syncInputWithViewport(previewViewport)
    }
  }, [previewViewport, isWidthInputFocused])

  // Если пришёл initialContent из API — десериализуем его в дерево Craft.
  useEffect(() => {
    if (!initialContent) return
    try {
      actions.deserialize(initialContent)
    } catch (e) {
      console.error("Не удалось десериализовать initialContent в Canvas:", e)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent])

  /**
   * Удаление выбранного элемента по Delete/Backspace.
   * Игнорируем нажатие, если фокус в поле редактирования (contentEditable, input, textarea),
   * чтобы не удалять элемент при удалении символов в тексте.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Delete" && e.key !== "Backspace") return
    const target = e.target as HTMLElement
    const isEditingText =
      target.getAttribute("contenteditable") === "true" ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA"
    if (isEditingText) return
    if (!selectedId || !canDeleteSelected) return
    e.preventDefault()
    e.stopPropagation()
    deleteCraftNode(actions, query, selectedId)
  }

  const handleUndo = () => {
    actions.history.undo()
  }

  const handleRedo = () => {
    actions.history.redo()
  }

  const templateContentListContext =
    pageType === PageType.TEMPLATE && collectionTypeId
      ? {
        collectionKey: collectionTypeId,
        itemData: templatePreviewItem,
      }
      : null

  const handleCanvasBackgroundClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    // Снимаем выделение, только если кликнули именно по фону холста, а не по внутренним элементам
    if (event.target === event.currentTarget) {
      actions.clearEvents()
    }
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.gray100,
      }}
    >
      {/* Панель действий над холстом (undo/redo + структура) */}
      <Box
        sx={{
          display: "flex",
          maxHeight: 28,
          height: 28,
          borderBottom: `1px solid ${COLORS.gray200}`,
          backgroundColor: COLORS.white,
          justifyContent: "space-between",
          padding: "2px 16px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <IconButton
              onClick={handleUndo}
              size="small"
              sx={{ padding: "4px" }}
              title="Отменить"
            >
              <Box sx={{ transform: "scaleX(-1)", display: "inline-flex", transformOrigin: "center" }}>
                <UpdateIcon size={16} fill={COLORS.gray500}/>
              </Box>

            </IconButton>
            <IconButton onClick={handleRedo} size="small" sx={{ padding: "4px" }}>
              <UpdateIcon size={16} fill={COLORS.gray500}/>
            </IconButton>
          </Box>

          <Box
            sx={{
              width: "1px",
              height: 20,
              backgroundColor: COLORS.gray200,
            }}
          />

          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              fontSize: "12px",
              color: COLORS.gray700,
            }}
          >
            {breadcrumb.map((name, index) => (
              <Box
                key={`${name}-${index}`}
                sx={{ display: "flex", alignItems: "center" }}
              >
                {index > 0 && (
                  <Box sx={{ mx: "4px" }}>
                    {">"}
                  </Box>
                )}
                <Box>{name}</Box>
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{display: "flex", columnGap: "12px"}}>
          <Box sx={{
            padding: "0 4px",
            display: "flex",
            alignItems: "center",
            backgroundColor: COLORS.gray100,
            borderRadius: "4px",
          }}>
            <Box
              component="input"
              value={widthInput}
              onFocus={() => setIsWidthInputFocused(true)}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const digitsOnly = event.target.value.replace(/\D/g, "")
                setWidthInput(digitsOnly)
              }}
              onBlur={() => {
                setIsWidthInputFocused(false)
                commitWidthInput()
              }}
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                event.stopPropagation()
                if (event.key === "Enter") {
                  event.preventDefault()
                  commitWidthInput()
                  event.currentTarget.blur()
                }
              }}
              inputMode="numeric"
              aria-label="Ширина превью в пикселях"
              sx={{
                width: 36,
                height: 22,
                border: "none",
                fontSize: "12px",
                color: COLORS.gray700,
                outline: "none",
                backgroundColor: COLORS.gray100,

                "&:focus": {
                  borderColor: COLORS.purple400,
                },
              }}
            />
            <Box sx={{ fontSize: "12px", lineHeight: "14px", color: COLORS.gray600 }}>px</Box>
          </Box>

          <Box sx={{ display: "flex", columnGap: "4px", alignItems: "center" }}>
            {!isRn && <IconButton
              onClick={(e) => {
                e.stopPropagation()
                handlePresetViewportChange(PreviewViewport.DESKTOP)
              }}
              size="small"
              title="Десктоп (1)"
              aria-label="Десктоп (1)"
              disableRipple
              sx={{
                borderRadius: "2px",
                padding: "2px",
                backgroundColor: previewViewport === PreviewViewport.DESKTOP ? COLORS.purple100 : "transparent",
              }}
            >
              <MonitorIcon fill={previewViewport === PreviewViewport.DESKTOP ? COLORS.purple400 : COLORS.gray600}/>
            </IconButton>}

            <IconButton
              disableRipple
              onClick={(e) => {
                e.stopPropagation()
                handlePresetViewportChange(PreviewViewport.TABLET_LANDSCAPE)
              }}
              size="small"
              title={
                isRn
                  ? "Горизонтальный планшет (1)"
                  : "Горизонтальный планшет (2)"
              }
              aria-label={
                isRn
                  ? "Горизонтальный планшет (1)"
                  : "Горизонтальный планшет (2)"
              }
              sx={{
                transform: "rotate(270deg)",
                borderRadius: "2px",
                padding: "2px",
                backgroundColor: previewViewport === PreviewViewport.TABLET_LANDSCAPE ? COLORS.purple100 : "transparent",
              }}
            >
              <TabletIcon
                fill={previewViewport === PreviewViewport.TABLET_LANDSCAPE ? COLORS.purple400 : COLORS.gray600}/>
            </IconButton>

            <IconButton
              disableRipple
              onClick={(e) => {
                e.stopPropagation()
                handlePresetViewportChange(PreviewViewport.TABLET)
              }}
              size="small"
              title={isRn ? "Планшет (2)" : "Планшет (3)"}
              aria-label={isRn ? "Планшет (2)" : "Планшет (3)"}
              sx={{
                borderRadius: "2px",
                padding: 0,
                backgroundColor: previewViewport === PreviewViewport.TABLET ? COLORS.purple100 : "transparent",
              }}

            >
              <TabletIcon fill={previewViewport === PreviewViewport.TABLET ? COLORS.purple400 : COLORS.gray600}/>
            </IconButton>

            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                handlePresetViewportChange(PreviewViewport.PHONE_LANDSCAPE)
              }}
              size="small"
              title={
                isRn
                  ? "Горизонтальный телефон (3)"
                  : "Горизонтальный телефон (4)"
              }
              aria-label={
                isRn
                  ? "Горизонтальный телефон (3)"
                  : "Горизонтальный телефон (4)"
              }
              disableRipple
              sx={{
                borderRadius: "2px",
                padding: "2px",
                backgroundColor: previewViewport === PreviewViewport.PHONE_LANDSCAPE ? COLORS.purple100 : "transparent",
                transform: "rotate(270deg)",
              }}
            >
              <MobileIcon fill={previewViewport === PreviewViewport.PHONE_LANDSCAPE ? COLORS.purple400 : COLORS.gray600}/>
            </IconButton>

            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                handlePresetViewportChange(PreviewViewport.PHONE)
              }}
              size="small"
              title={isRn ? "Телефон (4)" : "Телефон (5)"}
              aria-label={isRn ? "Телефон (4)" : "Телефон (5)"}
              disableRipple
              sx={{
                borderRadius: "2px",
                padding: "2px",
                backgroundColor: previewViewport === PreviewViewport.PHONE ? COLORS.purple100 : "transparent",
              }}
            >
              <MobileIcon fill={previewViewport === PreviewViewport.PHONE ? COLORS.purple400 : COLORS.gray600}/>
            </IconButton>
          </Box>
        </Box>
      </Box>
      {/* Сам холст, подключённый к Craft.js */}
      <Box
        ref={canvasRef}
        tabIndex={-1}
        sx={{
          flex: 1,
          padding: "0 8px 8px",
          display: "flex",
          position: "relative",
          outline: "none",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
          scrollbarColor: `${COLORS.gray300} transparent`,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: COLORS.gray300,
            borderRadius: "3px",
            "&:hover": {
              backgroundColor: COLORS.gray400,
            },
          },
        }}
        onClick={handleCanvasBackgroundClick}
        onKeyDown={handleKeyDown}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: appliedPreviewWidth,
            marginLeft: "auto",
            marginRight: "auto",
            backgroundColor: COLORS.white,
            display: "flex",
          }}
        >
          {templateContentListContext ? (
            <ContentListDataContext.Provider value={templateContentListContext}>
              <Frame>
                <Element is={CraftBody} canvas/>
              </Frame>
            </ContentListDataContext.Provider>
          ) : (
            <Frame>
              <Element is={CraftBody} canvas/>
            </Frame>
          )}
        </Box>
        <Box
          id="builder-badge-overlay-root"
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 20,
          }}
        />
      </Box>
    </Box>
  )
}

