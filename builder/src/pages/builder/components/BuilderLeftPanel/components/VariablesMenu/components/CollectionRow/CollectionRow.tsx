import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react"
import { ChevronRightIcon } from "../../../../../../../../icons/ChevronRightIcon.tsx"
import { DragIcon } from "../../../../../../../../icons/DragIcon.tsx"
import { MoreHorizontalIcon } from "../../../../../../../../icons/MoreHorizontalIcon.tsx"
import { COLORS } from "../../../../../../../../theme/colors.ts"
import {
  CollectionChevronSection,
  CollectionDragHandle,
  CollectionMoreButton,
  CollectionMoreSection,
  CollectionName,
  CollectionNameEditing,
  CollectionRowRoot,
  VariablesContextMenu,
  VariablesContextMenuItem,
  variablesMenuPaperSx,
} from "./styles.ts"

interface Props {
  id: string
  name: string
  isSelected: boolean
  menuZIndex: number
  onSelect: (id: string) => void
  onRename: (id: string, name: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  canDelete: boolean
}

const suppressBlurUntil = (ref: { current: number }, ms = 250) => {
  ref.current = Date.now() + ms
}

export const CollectionRow = ({
  id,
  name,
  isSelected,
  menuZIndex,
  onSelect,
  onRename,
  onDuplicate,
  onDelete,
  canDelete,
}: Props) => {
  const rowRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const ignoreBlurUntilRef = useRef(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(name)
  const isMenuOpen = Boolean(anchorEl)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  useEffect(() => {
    if (!isEditing) {
      setDraftName(name)
    }
  }, [name, isEditing])

  const handleCommitRename = useCallback(() => {
    if (Date.now() < ignoreBlurUntilRef.current) return

    const trimmed = draftName.trim()
    if (trimmed && trimmed !== name) {
      onRename(id, trimmed)
    } else {
      setDraftName(name)
    }
    setIsEditing(false)
  }, [draftName, id, name, onRename])

  useEffect(() => {
    if (!isEditing) return

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (rowRef.current?.contains(event.target as Node)) return
      handleCommitRename()
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [isEditing, handleCommitRename])

  const stopRowEvent = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleRowClick = () => {
    if (isEditing) return
    onSelect(id)
  }

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl((current) =>
      current === event.currentTarget ? null : event.currentTarget,
    )
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const runMenuAction = (action: () => void) => (event: MouseEvent<HTMLElement>) => {
    stopRowEvent(event)
    handleCloseMenu()
    window.setTimeout(action, 0)
  }

  const handleStartRename = () => {
    setDraftName(name)
    suppressBlurUntil(ignoreBlurUntilRef)
    setIsEditing(true)
    window.setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }

  const handleRenameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      handleCommitRename()
    }
    if (event.key === "Escape") {
      event.preventDefault()
      setDraftName(name)
      setIsEditing(false)
    }
  }

  const rootClassName = [
    isSelected ? "collection-row-selected" : "",
    isMenuOpen ? "collection-row-menu-open" : "",
    isEditing ? "collection-row-editing" : "",
  ]
    .filter(Boolean)
    .join(" ") || undefined

  return (
    <>
      <CollectionRowRoot
        ref={(node) => {
          setNodeRef(node as HTMLElement)
          rowRef.current = node as HTMLDivElement | null
        }}
        className={rootClassName}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.85 : 1,
          touchAction: "none",
        }}
        onMouseDown={stopRowEvent}
        onClick={handleRowClick}
      >
        <CollectionDragHandle
          {...attributes}
          {...listeners}
        >
          <DragIcon size={16} fill={COLORS.gray600} />
        </CollectionDragHandle>

        {isEditing ? (
          <CollectionNameEditing
            inputRef={inputRef}
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={handleCommitRename}
            onKeyDown={handleRenameKeyDown}
            onMouseDown={stopRowEvent}
            onClick={stopRowEvent}
          />
        ) : (
          <CollectionName title={name}>{name}</CollectionName>
        )}

        {!isEditing && (
          <>
            <CollectionMoreSection className="collection-row-more-section">
              <CollectionMoreButton
                role="button"
                tabIndex={0}
                onMouseDown={handleOpenMenu}
              >
                <MoreHorizontalIcon size={16} fill={COLORS.gray700} />
              </CollectionMoreButton>
            </CollectionMoreSection>

            <CollectionChevronSection className="collection-row-chevron-section">
              <ChevronRightIcon size={16} fill={COLORS.gray600} />
            </CollectionChevronSection>
          </>
        )}
      </CollectionRowRoot>

      <VariablesContextMenu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        disableAutoFocusItem
        disableRestoreFocus
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ zIndex: menuZIndex }}
        PaperProps={{ sx: variablesMenuPaperSx }}
        MenuListProps={{
          onMouseDown: (event) => {
            event.stopPropagation()
          },
        }}
      >
        <VariablesContextMenuItem onMouseDown={runMenuAction(handleStartRename)}>
          Переименовать
        </VariablesContextMenuItem>
        <VariablesContextMenuItem onMouseDown={runMenuAction(() => onDuplicate(id))}>
          Дублировать
        </VariablesContextMenuItem>
        <VariablesContextMenuItem
          onMouseDown={runMenuAction(() => onDelete(id))}
          disabled={!canDelete}
        >
          Удалить
        </VariablesContextMenuItem>
      </VariablesContextMenu>
    </>
  )
}
