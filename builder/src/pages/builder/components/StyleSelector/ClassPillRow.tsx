import { useState, type KeyboardEvent, type MouseEvent } from "react"
import { Menu, MenuItem } from "@mui/material"
import { ChevronDownIcon } from "../../../../icons/ChevronDownIcon.tsx"
import { COLORS } from "../../../../theme/colors.ts"
import {
  ClassPill,
  ClassPillChevronButton,
  ClassPillEditing,
  ClassPillRowRoot,
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(name)

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleStartRename = () => {
    setDraftName(name)
    setIsEditing(true)
    handleCloseMenu()
  }

  const handleCommitRename = () => {
    const trimmed = draftName.trim()
    if (trimmed && trimmed !== name) {
      onRename(index, trimmed)
    }
    setIsEditing(false)
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
    handleCloseMenu()
  }

  const handleDelete = () => {
    if (!isLast) return
    onDelete(index)
    handleCloseMenu()
  }

  return (
    <>
      <ClassPillRowRoot data-class-id={classId}>
        {isEditing ? (
          <ClassPillEditing
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={handleCommitRename}
            onKeyDown={handleRenameKeyDown}
            autoFocus
            fullWidth
          />
        ) : (
          <ClassPill title={name}>{name}</ClassPill>
        )}
        {!isEditing && (
          <ClassPillChevronButton
            className="class-pill-chevron"
            role="button"
            tabIndex={0}
            onClick={handleOpenMenu}
          >
            <ChevronDownIcon size={12} fill={COLORS.gray700} />
          </ClassPillChevronButton>
        )}
      </ClassPillRowRoot>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        disableAutoFocusItem
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          root: { sx: { zIndex: menuZIndex } },
        }}
      >
        <MenuItem onClick={handleStartRename}>Переименовать</MenuItem>
        <MenuItem onClick={handleCopy}>Копировать</MenuItem>
        <MenuItem onClick={handleDelete} disabled={!isLast}>
          Удалить
        </MenuItem>
      </Menu>
    </>
  )
}
