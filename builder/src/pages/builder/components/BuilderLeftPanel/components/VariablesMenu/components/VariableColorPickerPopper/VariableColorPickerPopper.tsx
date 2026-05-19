import { useEffect, useRef } from "react"
import { Paper, Popper } from "@mui/material"
import { COLORS } from "../../../../../../../../theme/colors.ts"
import { CraftSettingsColorField } from "../../../../../craftSettingsControls/CraftSettingsColorField.tsx"

interface Props {
  anchorEl: HTMLElement | null
  open: boolean
  value: string
  zIndex: number
  onChange: (value: string) => void
  onClose: () => void
}

export const VariableColorPickerPopper = ({
  anchorEl,
  open,
  value,
  zIndex,
  onChange,
  onClose,
}: Props) => {
  const popperRef = useRef<HTMLDivElement | null>(null)

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

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
      style={{ zIndex }}
    >
      <Paper
        ref={popperRef}
        elevation={3}
        onMouseDown={(event) => event.stopPropagation()}
        sx={{
          width: 220,
          border: `1px solid ${COLORS.purple100}`,
          borderRadius: "8px",
          padding: "8px",
          backgroundColor: COLORS.white,
        }}
      >
        <CraftSettingsColorField
          label="Цвет"
          hideLabel
          value={value}
          onChange={onChange}
        />
      </Paper>
    </Popper>
  )
}
