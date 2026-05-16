import { useMemo, useState, type MouseEvent } from "react"
import { Menu, MenuItem } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ChevronDownIcon } from "../../../../icons/ChevronDownIcon.tsx"
import { useStyleEditing } from "../../hooks/useStyleEditing.ts"
import {
  ClassPill,
  MenuItemRow,
  PlaceholderText,
  SelectorChevron,
  SelectorField,
  SelectorHeaderRow,
  SelectorLabel,
  SelectorRoot,
  UsageHint,
} from "./styles.ts"

export const StyleSelector = () => {
  const theme = useTheme()
  const {
    selectedId,
    styleClassId,
    activeClass,
    assignStyleClass,
    listClassesForSelected,
    countNodesWithClass,
  } = useStyleEditing()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  /** {@link BuilderPage} — zIndex modal+1; иначе MUI Menu оказывается под оболочкой билдера. */
  const menuZIndex = theme.zIndex.modal + 50

  const options = useMemo(
    () => listClassesForSelected(),
    [listClassesForSelected],
  )
  const usageCount = styleClassId ? countNodesWithClass(styleClassId) : 0

  if (!selectedId) {
    return null
  }

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSelect = (classId: string) => {
    assignStyleClass(classId)
    handleClose()
  }

  const handleClear = () => {
    assignStyleClass(null)
    handleClose()
  }

  return (
    <SelectorRoot>
      <SelectorHeaderRow>
        <SelectorLabel>Селектор стилей</SelectorLabel>
      </SelectorHeaderRow>
      <SelectorField onClick={handleOpen} role="button" tabIndex={0}>
        {activeClass ? (
          <ClassPill title={activeClass.name}>{activeClass.name}</ClassPill>
        ) : (
          <PlaceholderText>Выберите класс…</PlaceholderText>
        )}
        <SelectorChevron>
          <ChevronDownIcon />
        </SelectorChevron>
      </SelectorField>
      {styleClassId && (
        <UsageHint>
          {usageCount === 1
            ? "1 на этой странице"
            : `${usageCount} на этой странице`}
        </UsageHint>
      )}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        disableAutoFocusItem
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          root: { sx: { zIndex: menuZIndex } },
          paper: {
            sx: { maxHeight: 320, minWidth: anchorEl?.offsetWidth ?? 240 },
          },
        }}
      >
        {options.length === 0 && (
          <MenuItem disabled>Нет классов — задайте стили элементу</MenuItem>
        )}
        {options.map((item) => (
          <MenuItem
            key={item.id}
            selected={item.id === styleClassId}
            onClick={() => handleSelect(item.id)}
          >
            <MenuItemRow>
              <span>{item.name}</span>
              <UsageHint sx={{ marginTop: 0 }}>
                {countNodesWithClass(item.id)} на странице · {item.resolvedName}
              </UsageHint>
            </MenuItemRow>
          </MenuItem>
        ))}
        {styleClassId && (
          <MenuItem onClick={handleClear}>Без класса (только базовые стили)</MenuItem>
        )}
      </Menu>
    </SelectorRoot>
  )
}
