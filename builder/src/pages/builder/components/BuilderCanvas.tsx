import { useEffect, useRef } from "react"
import { Box, IconButton } from "@mui/material"
import { Frame, Element, useEditor, type SerializedNodes } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import { CraftBody } from "../../../craft/Body.tsx"
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts"
import { UpdateIcon } from "../../../icons/UpdateIcon"

interface BuilderCanvasProps {
  initialContent: SerializedNodes | null
}

export const BuilderCanvas = ({ initialContent }: BuilderCanvasProps) => {
  const { actions } = useEditor()
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

  useEffect(() => {
    if (selectedId && canvasRef.current) {
      canvasRef.current.focus()
    }
  }, [selectedId])

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
    actions.delete(selectedId)
  }

  const handleUndo = () => {
    actions.history.undo()
  }

  const handleRedo = () => {
    actions.history.redo()
  }

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
          maxHeight: 28,
          height: 28,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderBottom: `1px solid ${COLORS.gray200}`,
          backgroundColor: COLORS.white,
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

      {/* Сам холст, подключённый к Craft.js */}
      <Box
        ref={canvasRef}
        tabIndex={-1}
        sx={{
          flex: 1,
          padding: "0 8px 8px",
          display: "flex",
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
            backgroundColor: COLORS.white,
            display: "flex",
          }}
        >
          <Frame>
            <Element is={CraftBody} canvas />
          </Frame>
        </Box>
      </Box>
    </Box>
  )
}

