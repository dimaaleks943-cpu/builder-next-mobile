import { useMemo, useState, type MouseEvent } from "react"
import { Menu, MenuItem } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ChevronDownIcon } from "../../../../icons/ChevronDownIcon.tsx"
import { useStyleEditing } from "../../hooks/useStyleEditing.ts"
import { ClassPillRow } from "./ClassPillRow.tsx"
import {
  ClassPillStack,
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
    styleClassIds,
    styleClassPills,
    appendStyleClass,
    clearStyleClasses,
    removeLastStyleClass,
    renameStyleClassOnElement,
    copyStyleClassOnElement,
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

  const appendableOptions = useMemo(
    () => options.filter((item) => !styleClassIds.includes(item.id)),
    [options, styleClassIds],
  )

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

  const handleAppend = (classId: string) => {
    appendStyleClass(classId)
    handleClose()
  }

  const handleClear = () => {
    clearStyleClasses()
    handleClose()
  }

  return (
    <SelectorRoot>
      <SelectorHeaderRow>
        <SelectorLabel>Селектор стилей</SelectorLabel>
      </SelectorHeaderRow>

      {styleClassPills.length > 0 && (
        <ClassPillStack>
          {styleClassPills.map((pill, index) => (
            <ClassPillRow
              key={`${pill.id}-${index}`}
              classId={pill.id}
              name={pill.name}
              index={index}
              isLast={index === styleClassPills.length - 1}
              menuZIndex={menuZIndex}
              onRename={renameStyleClassOnElement}
              onCopy={copyStyleClassOnElement}
              onDelete={() => removeLastStyleClass()}
            />
          ))}
        </ClassPillStack>
      )}

      <SelectorField onClick={handleOpen} role="button" tabIndex={0}>
        <PlaceholderText>
          {styleClassIds.length === 0 ? "Выберите класс…" : "Добавить класс…"}
        </PlaceholderText>
        <SelectorChevron>
          <ChevronDownIcon />
        </SelectorChevron>
      </SelectorField>

      {styleClassIds.length > 0 && (
        <UsageHint>
          {styleClassIds
            .map((id) => countNodesWithClass(id))
            .reduce((max, n) => Math.max(max, n), 0)}{" "}
          на этой странице (стек)
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
        {appendableOptions.length === 0 && styleClassIds.length > 0 && (
          <MenuItem disabled>Все классы уже добавлены</MenuItem>
        )}
        {appendableOptions.length === 0 && styleClassIds.length === 0 && (
          <MenuItem disabled>Нет классов — задайте стили элементу</MenuItem>
        )}
        {appendableOptions.map((item) => (
          <MenuItem key={item.id} onClick={() => handleAppend(item.id)}>
            <MenuItemRow>
              <span>{item.name}</span>
              <UsageHint sx={{ marginTop: 0 }}>
                {countNodesWithClass(item.id)} на странице · {item.resolvedName}
              </UsageHint>
            </MenuItemRow>
          </MenuItem>
        ))}
        {styleClassIds.length > 0 && (
          <MenuItem onClick={handleClear}>Без класса (только базовые стили)</MenuItem>
        )}
      </Menu>
    </SelectorRoot>
  )
}
