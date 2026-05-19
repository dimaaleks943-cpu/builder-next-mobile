import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react"
import { ChevronDownIcon } from "../../../../icons/ChevronDownIcon.tsx"
import { COLORS } from "../../../../theme/colors.ts"
import {
  ClassPill,
  ClassPillChevronButton,
  ClassPillChevronSection,
  ClassPillDivider,
  ClassPillEditing,
  ClassPillRowRoot,
  StyleSelectorMenu,
  StyleSelectorMenuItem,
  styleSelectorMenuPaperSx,
} from "./styles.ts"

interface Props {
  classId: string
  name: string
  index: number
  isLast: boolean
  menuZIndex: number
  onRename: (index: number, newName: string) => void
  onCopy: (index: number) => void
  onDelete: (index: number) => void
}

const suppressBlurUntil = (ref: { current: number }, ms = 250) => {
  ref.current = Date.now() + ms
}

export const ClassPillRow = ({
  classId,
  name,
  index,
  isLast,
  menuZIndex,
  onRename,
  onCopy,
  onDelete,
}: Props) => {
  const pillRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const ignoreBlurUntilRef = useRef(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(name)
  const isMenuOpen = Boolean(anchorEl)

  useEffect(() => {
    if (!isEditing) {
      setDraftName(name)
    }
  }, [name, isEditing])

  const handleCommitRename = useCallback(() => {
    if (Date.now() < ignoreBlurUntilRef.current) return

    const trimmed = draftName.trim()
    if (trimmed && trimmed !== name) {
      onRename(index, trimmed)
    } else {
      setDraftName(name)
    }
    setIsEditing(false)
  }, [draftName, name, index, onRename])

  useEffect(() => {
    if (!isEditing) return

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (pillRef.current?.contains(event.target as Node)) return
      handleCommitRename()
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [isEditing, handleCommitRename])

  const stopPillEvent = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    stopPillEvent(event)
    setAnchorEl(pillRef.current)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const runMenuAction = (action: () => void) => (event: MouseEvent<HTMLElement>) => {
    stopPillEvent(event)
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

  const handleCopy = () => {
    onCopy(index)
  }

  const handleDelete = () => {
    if (!isLast) return
    onDelete(index)
  }

  const rootClassName = [
    isMenuOpen ? "class-pill-menu-open" : "",
    isEditing ? "class-pill-editing" : "",
  ]
    .filter(Boolean)
    .join(" ") || undefined

  return (
    <>
      <ClassPillRowRoot
        ref={pillRef}
        data-class-id={classId}
        data-class-pill-row
        {...(isEditing ? { "data-class-pill-editing": true } : {})}
        className={rootClassName}
        onMouseDown={stopPillEvent}
        onClick={stopPillEvent}
      >
        {isEditing ? (
          <ClassPillEditing
            inputRef={inputRef}
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={handleCommitRename}
            onKeyDown={handleRenameKeyDown}
            onMouseDown={stopPillEvent}
            onClick={stopPillEvent}
          />
        ) : (
          <ClassPill title={name}>{name}</ClassPill>
        )}
        {!isEditing && (
          <ClassPillChevronSection className="class-pill-chevron-section">
            <ClassPillDivider />
            <ClassPillChevronButton
              className="class-pill-chevron"
              role="button"
              tabIndex={0}
              onMouseDown={handleOpenMenu}
            >
              <ChevronDownIcon size={12} fill={COLORS.gray700} />
            </ClassPillChevronButton>
          </ClassPillChevronSection>
        )}
      </ClassPillRowRoot>
      <StyleSelectorMenu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        disableAutoFocusItem
        disableRestoreFocus
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          root: { sx: { zIndex: menuZIndex } },
          paper: { sx: styleSelectorMenuPaperSx },
        }}
      >
        <StyleSelectorMenuItem onMouseDown={runMenuAction(handleStartRename)}>
          Переименовать
        </StyleSelectorMenuItem>
        <StyleSelectorMenuItem onMouseDown={runMenuAction(handleCopy)}>
          Копировать
        </StyleSelectorMenuItem>
        <StyleSelectorMenuItem
          onMouseDown={runMenuAction(handleDelete)}
          disabled={!isLast}
        >
          Удалить
        </StyleSelectorMenuItem>
      </StyleSelectorMenu>
    </>
  )
}
