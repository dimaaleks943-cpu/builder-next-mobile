import { Box, Popper } from "@mui/material"
import type { ChangeEvent, MouseEvent as ReactMouseEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { COLORS } from "../../../../theme/colors.ts"
import { CraftSettingsStyleResetFooter } from "./CraftSettingsStyleResetFooter.tsx"
import {
  CraftSettingsFixedLabel,
  CraftSettingsResetPopoverPaper,
} from "./styles.ts"

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hideLabel?: boolean;
  disabled?: boolean;
  labelReset?: {
    hasValue: boolean;
    onReset: () => void;
  };
  /** @see CraftSettingsSelect.disableResetPopperPortal */
  disableResetPopperPortal?: boolean;
}

export const CraftSettingsColorField = ({
  label,
  value,
  onChange,
  hideLabel = false,
  disabled = false,
  labelReset,
  disableResetPopperPortal = false,
}: Props) => {
  const [resetAnchorEl, setResetAnchorEl] = useState<HTMLElement | null>(null)
  const resetPaperRef = useRef<HTMLDivElement | null>(null)
  const resetEnabled =
    Boolean(labelReset) && Boolean(labelReset?.hasValue) && !hideLabel

  useEffect(() => {
    if (!labelReset?.hasValue) {
      setResetAnchorEl(null)
    }
  }, [labelReset?.hasValue])

  useEffect(() => {
    if (!resetEnabled || !resetAnchorEl) return
    const onDocMouseDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node
      if (resetAnchorEl.contains(target)) return
      if (resetPaperRef.current?.contains(target)) return
      setResetAnchorEl(null)
    }
    document.addEventListener("mousedown", onDocMouseDown, true)
    return () => document.removeEventListener("mousedown", onDocMouseDown, true)
  }, [resetEnabled, resetAnchorEl])

  const handleResetLabelClick = (event: ReactMouseEvent<HTMLElement>) => {
    setResetAnchorEl(event.currentTarget)
  }

  const handleFooterReset = () => {
    labelReset?.onReset()
    setResetAnchorEl(null)
  }

  const renderLabel = () => {
    if (hideLabel) return null
    if (!labelReset || !labelReset.hasValue) {
      return (
        <CraftSettingsFixedLabel>{label}</CraftSettingsFixedLabel>
      )
    }

    return (
      <>
        <CraftSettingsFixedLabel
          onClick={handleResetLabelClick}
          component="span"
          sx={{
            color: COLORS.purple400,
            fontWeight: 400,
            cursor: "pointer",
          }}
        >
          {label}
        </CraftSettingsFixedLabel>
        <Popper
          open={Boolean(resetAnchorEl)}
          anchorEl={resetAnchorEl}
          placement="bottom-start"
          modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
          style={{ zIndex: 4000 }}
          disablePortal={disableResetPopperPortal}
        >
          <CraftSettingsResetPopoverPaper ref={resetPaperRef} elevation={3}>
            <CraftSettingsStyleResetFooter onReset={handleFooterReset}/>
          </CraftSettingsResetPopoverPaper>
        </Popper>
      </>
    )
  }

  const handlePickerChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: hideLabel ? 0 : "8px",
        ...(disabled ? { opacity: 0.55, pointerEvents: "none" } : {}),
      }}
    >
      {renderLabel()}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
          padding: "4px 8px",
          borderRadius: "4px",
          border: `1px solid ${COLORS.purple100}`,
          backgroundColor: COLORS.white,
          gap: "6px",
        }}
      >
        <Box
          sx={{
            width: "12px",
            height: "12px",
            borderRadius: "2px",
            border: `1px solid ${COLORS.gray300}`,
            backgroundColor: value || COLORS.black,
            position: "relative",
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          <Box
            component="input"
            type="color"
            value={value}
            onChange={handlePickerChange}
            sx={{
              width: "18px",
              height: "18px",
              position: "absolute",
              inset: 0,
              opacity: 0,
              cursor: "pointer",
              padding: 0,
              border: "none",
            }}
          />
        </Box>
        <Box
          component="input"
          type="text"
          value={value}
          onChange={handleTextChange}
          sx={{
            flex: 1,
            minWidth: 0,
            width: 0,
            boxSizing: "border-box",
            border: "none",
            outline: "none",
            padding: 0,
            fontSize: "12px",
            lineHeight: "14px",
            color: COLORS.black,
          }}
        />
      </Box>
    </Box>
  )
}

