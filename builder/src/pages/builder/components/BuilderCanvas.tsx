import { Box, IconButton } from "@mui/material"
import { Frame, Element, useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import { Block } from "../../../craft/Block.tsx";

export const BuilderCanvas = () => {
  const { actions } = useEditor()

  /**
   * Рекурсивно собираем историю вложености предков через parent
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

    const names = allIds.map((id) => {
      const node = state.nodes[id]
      if (!node) {
        return "Element"
      }

      // TODO Craft сам кладёт displayName узла в node.data.displayName, пока только для Block.tsx
      const displayName = node.data.displayName as string | undefined
      if (displayName) {
        return displayName
      }

      const type = node.data.type
      if (typeof type === "string") {
        return type
      }

      if (type && typeof (type as any).resolvedName === "string") {
        return (type as any).resolvedName as string
      }

      if (type && typeof (type as any).craft?.displayName === "string") {
        return (type as any).craft.displayName as string
      }

      return "Element"
    })

    return { breadcrumb: names }
  })

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
      {/* Панель действий над холстом (undo/redo и т.п.) */}
      <Box
        sx={{
          height: "28px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${COLORS.gray200}`,
          backgroundColor: COLORS.white,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            fontSize: "12px",
            color: COLORS.red300,
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

        <Box>
          <IconButton
            onClick={handleUndo}
            sx={{ padding: 0, mr: 1 }}
          >
            {"↶"}
          </IconButton>
          <IconButton
            onClick={handleRedo}
            sx={{ padding: 0 }}
          >
            {"↷"}
          </IconButton>
        </Box>
      </Box>

      {/* Сам холст, подключённый к Craft.js */}
      <Box
        sx={{
          flex: 1,
          padding: "0 8px 8px",
          display: "flex",
        }}
        onClick={handleCanvasBackgroundClick}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundColor: COLORS.white,
            display: "flex",
          }}
        >
          <Frame>
            <Element
              is={Block}
              canvas
              fullSize
            />
          </Frame>
        </Box>
      </Box>
    </Box>
  )
}

