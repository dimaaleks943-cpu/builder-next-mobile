import { Popper } from "@mui/material"
import { useEffect, useMemo, useRef, useState } from "react"
import { COLORS } from "../../../../../../../theme/colors.ts"
import {
  getColorVariablesByCollection,
  getColorVariableById,
} from "../../../../../variables/designVariablesRegistry.ts"
import type { ColorVariable, StyleVariableRef } from "../../../../../variables/types.ts"
import {
  ColorVariableConnectGroupTitle,
  ColorVariableConnectHeader,
  ColorVariableConnectItem,
  ColorVariableConnectItemName,
  ColorVariableConnectItemSwatch,
  ColorVariableConnectItemValue,
  ColorVariableConnectList,
  ColorVariableConnectPopoverPaper,
  ColorVariableConnectSearch,
  ColorVariableConnectSearchInput,
  ColorVariableConnectTitle,
} from "./styles.ts"

interface Props {
  anchorEl: HTMLElement | null
  open: boolean
  zIndex: number
  onSelect: (variable: ColorVariable) => void
  onClose: () => void
}

export const resolveColorFieldDisplay = (
  value: string | StyleVariableRef,
): {
  isVariable: boolean
  color: string
  label: string
} => {
  if (typeof value === "object" && value !== null && "$ref" in value) {
    const variable = getColorVariableById(value.$ref)
    return {
      isVariable: true,
      color: variable?.value ?? COLORS.black,
      label: variable?.name ?? value.$ref,
    }
  }

  return {
    isVariable: false,
    color: value || COLORS.black,
    label: value,
  }
}

export const ColorVariableConnectPopper = ({
  anchorEl,
  open,
  zIndex,
  onSelect,
  onClose,
}: Props) => {
  const popperRef = useRef<HTMLDivElement | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!open) {
      setSearchQuery("")
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const handleDocumentMouseDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node
      if (anchorEl?.contains(target)) return
      if (popperRef.current?.contains(target)) return
      onClose()
    }

    document.addEventListener("mousedown", handleDocumentMouseDown, true)
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown, true)
    }
  }, [anchorEl, onClose, open])

  const groupedVariables = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()

    return getColorVariablesByCollection()
      .map((group) => ({
        ...group,
        variables: group.variables.filter((variable) => {
          if (!normalized) return true
          return (
            variable.name.toLowerCase().includes(normalized) ||
            variable.value.toLowerCase().includes(normalized) ||
            group.collection.name.toLowerCase().includes(normalized)
          )
        }),
      }))
      .filter((group) => group.variables.length > 0)
  }, [searchQuery])

  const handleSelect = (variable: ColorVariable) => {
    onSelect(variable)
    onClose()
  }

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
      style={{ zIndex }}
    >
      <ColorVariableConnectPopoverPaper
        ref={popperRef}
        elevation={3}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <ColorVariableConnectHeader>
          <ColorVariableConnectTitle>Подключить</ColorVariableConnectTitle>
        </ColorVariableConnectHeader>

        <ColorVariableConnectSearch>
          <ColorVariableConnectSearchInput
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Поиск переменных..."
          />
        </ColorVariableConnectSearch>

        <ColorVariableConnectList>
          {groupedVariables.map(({ collection, variables }) => (
            <div key={collection.id}>
              <ColorVariableConnectGroupTitle>
                {collection.name}
              </ColorVariableConnectGroupTitle>

              {variables.map((variable) => (
                <ColorVariableConnectItem
                  key={variable.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(variable)}
                >
                  <ColorVariableConnectItemSwatch
                    sx={{ backgroundColor: variable.value }}
                  />
                  <ColorVariableConnectItemName title={variable.name}>
                    {variable.name}
                  </ColorVariableConnectItemName>
                  <ColorVariableConnectItemValue title={variable.value}>
                    {variable.value}
                  </ColorVariableConnectItemValue>
                </ColorVariableConnectItem>
              ))}
            </div>
          ))}
        </ColorVariableConnectList>
      </ColorVariableConnectPopoverPaper>
    </Popper>
  )
}
