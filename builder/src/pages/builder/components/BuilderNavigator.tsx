import React, { useCallback, useState } from "react"
import { Box, Typography } from "@mui/material"
import { useEditor } from "@craftjs/core"
import { COLORS } from "../../../theme/colors"
import { ChevronRightIcon } from "../../../icons/ChevronRightIcon"
import { DragIcon } from "../../../icons/DragIcon"
import { resolveNodeDisplayName } from "../../../utils/resolveNodeDisplayName.ts"

interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}

const buildTree = (state: any, rootId: string): TreeNode[] => {
  const root = state.nodes[rootId]
  if (!root) return []

  const childIds: string[] = (root.data.nodes ?? []) as string[]

  const walk = (id: string): TreeNode | null => {
    const node = state.nodes[id]
    if (!node) return null

    const name = resolveNodeDisplayName(node)
    const childrenIds: string[] = (node.data.nodes ?? []) as string[]

    const children: TreeNode[] = []
    for (const childId of childrenIds) {
      const child = walk(childId)
      if (child) children.push(child)
    }

    return { id, name, children }
  }

  const tree: TreeNode[] = []
  for (const id of childIds) {
    const node = walk(id)
    if (node) tree.push(node)
  }
  return tree
}

export const BuilderNavigator: React.FC = () => {
  const { actions, query } = useEditor()

  const { tree, selectedId } = useEditor((state) => {
    const treeNodes = buildTree(state, "ROOT")
    const [currentSelected] = Array.from(state.events.selected)
    return {
      tree: treeNodes,
      selectedId: (currentSelected as string | undefined) ?? null,
    }
  })

  const handleSelect = useCallback(
    (id: string) => {
      actions.selectNode(id)
    },
    [actions],
  )

  const handleDrop = useCallback(
    (
      sourceId: string,
      targetId: string,
      placement: "before" | "after" | "inside",
    ) => {
      if (!sourceId || !targetId || sourceId === targetId) return

      try {
        // В Craft actions.move(nodeId, targetParentId, index).
        // Для before/after: двигаем на уровень родителя target.
        // Для inside: двигаем в children самого target.
        if (placement === "inside") {
          const targetNode = query.node(targetId).get()
          const childIds: string[] =
            ((targetNode.data.nodes ?? []) as string[]) ?? []
          const insertIndex = childIds.length;
          (actions as any).move(sourceId, targetId, insertIndex);
        } else {
          const targetNode = query.node(targetId).get()
          const parentId = targetNode.data.parent as string | null
          if (!parentId) return

          const parentNode = query.node(parentId).get()
          const nodes: string[] =
            ((parentNode.data.nodes ?? []) as string[]) ?? []
          const targetIndex = nodes.indexOf(targetId)
          if (targetIndex === -1) return

          const insertIndex =
            placement === "before" ? targetIndex : targetIndex + 1;

          (actions as any).move(sourceId, parentId, insertIndex);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[BuilderNavigator] move failed", error)
      }
    },
    [actions, query],
  )

  const [dragState, setDragState] = useState<{
    targetId: string | null;
    placement: "before" | "after" | "inside" | null;
  }>({
    targetId: null,
    placement: null,
  })

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => ({
      ...prev,
      // По умолчанию узел свернут; первый клик должен раскрыть его.
      // Если состояния ещё нет (undefined) — считаем, что было false.
      [id]: !(prev[id] ?? false),
    }))
  }, [])

  const renderNode = (node: TreeNode, depth: number): React.ReactNode => {
    const isSelected = node.id === selectedId
    const hasChildren = node.children.length > 0
    // По умолчанию узлы свернуты, пока пользователь явно не раскроет их
    const isExpanded = expanded[node.id] ?? false

    const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData("application/x-craft-node-id", node.id)
      event.dataTransfer.effectAllowed = "move"
    }

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = "move"
      const rect = event.currentTarget.getBoundingClientRect()
      const offsetY = event.clientY - rect.top
      const third = rect.height / 3
      let placement: "before" | "after" | "inside"

      if (offsetY < third) {
        placement = "before"
      } else if (offsetY > third * 2) {
        placement = "after"
      } else {
        placement = "inside"
      }

      setDragState({ targetId: node.id, placement })
    }

    const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const sourceId = event.dataTransfer.getData(
        "application/x-craft-node-id",
      )
      if (sourceId) {
        const rect = event.currentTarget.getBoundingClientRect()
        const offsetY = event.clientY - rect.top
        const third = rect.height / 3
        let placement: "before" | "after" | "inside"

        if (offsetY < third) {
          placement = "before"
        } else if (offsetY > third * 2) {
          placement = "after"
        } else {
          placement = "inside"
        }

        handleDrop(sourceId, node.id, placement)
      }
      setDragState({ targetId: null, placement: null })
    }

    const onDragEnd = () => {
      setDragState({ targetId: null, placement: null })
    }

    return (
      <Box key={node.id}>
        <Box
          draggable
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          onClick={() => handleSelect(node.id)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            borderRadius: "4px",
            fontSize: "10px",
            lineHeight: "14px",
            paddingY: "4px",
            paddingRight: "4px",
            paddingLeft: `${8 + depth * 12}px`,
            backgroundColor: isSelected ? COLORS.blue100 : "transparent",
            color: COLORS.gray700,
            userSelect: "none",

            // Подсветка потенциального места вставки при DnD:
            // - если переносим "перед" узлом на том же уровне, рисуем линию сверху;
            // - если "после" — линию снизу;
            // - если "внутрь" (inside) — пунктирную рамку вокруг, показывая,
            //   что элемент станет дочерним этого узла.
            borderTop:
              dragState.targetId === node.id &&
              dragState.placement === "before"
                ? `2px solid ${COLORS.blue300}`
                : "transparent",
            borderBottom:
              dragState.targetId === node.id &&
              dragState.placement === "after"
                ? `2px solid ${COLORS.blue300}`
                : "transparent",
            outline:
              dragState.targetId === node.id &&
              dragState.placement === "inside"
                ? `1px dashed ${COLORS.blue300}`
                : "none",
            // Обычный hover: фиолетовый фон для не выбранных строк
            // и показ иконки перетаскивания справа.
            "&:hover": {
              backgroundColor: isSelected
                ? COLORS.blue100
                : COLORS.purple100,
              ".builder-nav-drag-icon": {
                opacity: 1,
              },
            },
          }}
        >
          {/* Левая часть: стрелка + имя узла */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minWidth: 0,
              flex: 1,
              gap: "2px",
            }}
          >
            {/* Иконка раскрытия для узлов с детьми */}
            <Box
              onClick={(event) => {
                event.stopPropagation()
                if (hasChildren) {
                  toggleExpanded(node.id)
                }
              }}
              sx={{
                width: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.gray500,
                fontSize: "9px",
                visibility: hasChildren ? "visible" : "hidden",
                transform:
                  hasChildren && isExpanded ? "rotate(90deg)" : "none",
                transition: "transform 120ms ease-out",
              }}
            >
              {hasChildren && (
                <ChevronRightIcon size={14} fill={COLORS.gray500}/>
              )}
            </Box>
            <Typography
              component="span"
              sx={{
                fontSize: "11px",
                lineHeight: "14px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {node.name}
            </Typography>
          </Box>

          {/* Правая часть: иконка перетаскивания, показывается только при hover строки */}
          <Box
            className="builder-nav-drag-icon"
            sx={{
              opacity: 0,
              transition: "opacity 120ms ease-out",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DragIcon size={14} fill={COLORS.gray500}/>
          </Box>
        </Box>
        {hasChildren && isExpanded &&
          node.children.map((child) => renderNode(child, depth + 1))}
      </Box>
    )
  }

  return (
    <Box
      sx={{
        borderTop: `1px solid ${COLORS.gray200}`,
        borderBottom: `1px solid ${COLORS.gray200}`,
        backgroundColor: COLORS.white,
        maxHeight: 260,
        overflowY: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: `${COLORS.gray300} transparent`,
        "&::-webkit-scrollbar": {
          width: "4px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: COLORS.gray300,
          borderRadius: "4px",
          "&:hover": {
            backgroundColor: COLORS.gray400,
          },
        },
      }}
    >
      <Box
        sx={{
          padding: "12px 8px",
          color: COLORS.black,
          fontWeight: 700,
          fontSize: "14px",
          lineHeight: "20px",
        }}>
        Блоки
      </Box>
      <Box sx={{ paddingY: "4px" }}>
        {tree.length === 0 ? (
          <Typography
            sx={{
              fontSize: "11px",
              color: COLORS.gray500,
              paddingX: "10px",
              paddingY: "4px",
            }}
          >
            Холст пуст — перетащи компонент из списка.
          </Typography>
        ) : (
          tree.map((node) => renderNode(node, 0))
        )}
      </Box>
    </Box>
  )
}

