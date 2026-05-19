import { useMemo, useRef, useState, type MouseEvent } from "react"
import { useTheme } from "@mui/material/styles"
import { ChevronDownIcon } from "../../../../icons/ChevronDownIcon.tsx"
import { COLORS } from "../../../../theme/colors.ts"
import { useStyleEditing } from "../../hooks/useStyleEditing.ts"
import { ClassPillRow } from "./ClassPillRow.tsx"
import {
  MenuItemPrimary,
  MenuItemRow,
  MenuItemSecondary,
  PlaceholderText,
  SelectorChevron,
  SelectorField,
  SelectorFieldSpacer,
  SelectorRoot,
  StyleSelectorMenu,
  StyleSelectorMenuItem,
  StyleSelectorMenuItemMulti,
  UsageHint,
  styleSelectorMenuPaperSx,
} from "./styles.ts"

export const StyleSelector = () => {
  const theme = useTheme()
  const fieldRef = useRef<HTMLDivElement>(null)
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
    const target = event.target as HTMLElement
    if (target.closest("[data-class-pill-row]")) return
    if (target.closest(".class-pill-chevron")) return
    if (document.querySelector("[data-class-pill-editing]")) return
    event.stopPropagation()
    setAnchorEl(fieldRef.current)
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

  const pageUsageCount =
    styleClassIds.length > 0
      ? styleClassIds
          .map((id) => countNodesWithClass(id))
          .reduce((max, n) => Math.max(max, n), 0)
      : 0

  return (
    <SelectorRoot>
      <SelectorField
        ref={fieldRef}
        onClick={handleOpen}
        role="button"
        tabIndex={0}
      >
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
            onDelete={removeLastStyleClass}
          />
        ))}
        {styleClassIds.length === 0 ? (
          <PlaceholderText>Выберите класс…</PlaceholderText>
        ) : (
          <SelectorFieldSpacer />
        )}
        <SelectorChevron>
          <ChevronDownIcon size={16} fill={COLORS.gray700} />
        </SelectorChevron>
      </SelectorField>

      {styleClassIds.length > 0 && (
        <UsageHint>
          {pageUsageCount} на этой странице
          {styleClassIds.length > 1 ? " (стек)" : ""}
        </UsageHint>
      )}

      <StyleSelectorMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        disableAutoFocusItem
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          root: { sx: { zIndex: menuZIndex } },
          paper: {
            sx: {
              ...styleSelectorMenuPaperSx,
              maxHeight: 320,
              minWidth: anchorEl?.offsetWidth ?? 227,
            },
          },
        }}
      >
        {appendableOptions.length === 0 && styleClassIds.length > 0 && (
          <StyleSelectorMenuItem disabled>Все классы уже добавлены</StyleSelectorMenuItem>
        )}
        {appendableOptions.length === 0 && styleClassIds.length === 0 && (
          <StyleSelectorMenuItem disabled>
            Нет классов — задайте стили элементу
          </StyleSelectorMenuItem>
        )}
        {appendableOptions.map((item) => (
          <StyleSelectorMenuItemMulti
            key={item.id}
            onClick={() => handleAppend(item.id)}
          >
            <MenuItemRow>
              <MenuItemPrimary>{item.name}</MenuItemPrimary>
              <MenuItemSecondary>
                {countNodesWithClass(item.id)} на странице · {item.resolvedName}
              </MenuItemSecondary>
            </MenuItemRow>
          </StyleSelectorMenuItemMulti>
        ))}
        {styleClassIds.length > 0 && (
          <StyleSelectorMenuItem onClick={handleClear}>
            Без класса (только базовые стили)
          </StyleSelectorMenuItem>
        )}
      </StyleSelectorMenu>
    </SelectorRoot>
  )
}
