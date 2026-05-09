import { useEffect, useRef, useState } from "react"
import { Box, Paper, Popper, Typography } from "@mui/material"
import type { ChangeEvent, MouseEvent as ReactMouseEvent } from "react"
import { COLORS } from "../../../../theme/colors.ts"
import { ChevronRightIcon } from "../../../../icons/ChevronRightIcon.tsx"
import { CraftSettingsStyleResetFooter } from "./CraftSettingsStyleResetFooter.tsx"

interface Option {
  id: string;
  value: string;
}

interface Props {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  disabled?: boolean;
  /** When false, only the select is shown (full width); label is omitted and used as `aria-label`. */
  showInlineLabel?: boolean;
  /**
   * When set together with {@link showInlineLabel}, the label uses the reset affordance:
   * purple and clickable when `hasValue` is true; opens the same reset popover as other craft settings.
   */
  labelReset?: {
    hasValue: boolean;
    onReset: () => void;
  };
}

export const CraftSettingsSelect = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  showInlineLabel = true,
  labelReset,
}: Props) => {
  const [resetAnchorEl, setResetAnchorEl] = useState<HTMLElement | null>(null)
  const resetPaperRef = useRef<HTMLDivElement | null>(null)
  const resetEnabled =
    Boolean(showInlineLabel) &&
    Boolean(labelReset) &&
    Boolean(labelReset?.hasValue)

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

  const selectShellSx = showInlineLabel
    ? {
        flex: 4,
        position: "relative" as const,
        display: "flex",
        alignItems: "center",
      }
    : {
        flex: 1,
        width: "100%",
        minWidth: 0,
        position: "relative" as const,
        display: "flex",
        alignItems: "center",
      }

  const labelBaseSx = {
    fontSize: "10px",
    lineHeight: "14px",
    flex: 1,
  }

  const renderInlineLabel = () => {
    if (!showInlineLabel) return null

    if (!labelReset) {
      return (
        <Typography
          sx={{
            ...labelBaseSx,
            color: COLORS.gray700,
          }}
        >
          {label}
        </Typography>
      )
    }

    if (!labelReset.hasValue) {
      return (
        <Typography
          sx={{
            ...labelBaseSx,
            color: COLORS.gray700,
          }}
        >
          {label}
        </Typography>
      )
    }

    return (
      <>
        <Typography
          onClick={handleResetLabelClick}
          component="span"
          sx={{
            ...labelBaseSx,
            color: COLORS.purple400,
            fontWeight: 400,
            cursor: "pointer",
          }}
        >
          {label}
        </Typography>
        <Popper
          open={Boolean(resetAnchorEl)}
          anchorEl={resetAnchorEl}
          placement="bottom-start"
          modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
          style={{ zIndex: 4000 }}
        >
          <Paper
            ref={resetPaperRef}
            elevation={3}
            sx={{
              width: "211px",
              border: `1px solid ${COLORS.purple100}`,
              borderRadius: "8px",
              padding: "8px",
            }}
          >
            <CraftSettingsStyleResetFooter onReset={handleFooterReset} />
          </Paper>
        </Popper>
      </>
    )
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        columnGap: "8px",
        ...(showInlineLabel ? {} : { width: "100%", minWidth: 0 }),
      }}
    >
      {renderInlineLabel()}
      <Box sx={selectShellSx}>
        <Box
          component="select"
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-label={showInlineLabel ? undefined : label}
          sx={{
            width: "100%",
            boxSizing: "border-box",
            padding: "6px 8px",
            paddingRight: "24px",
            fontSize: "12px",
            lineHeight: "14px",
            borderRadius: "4px",
            border: `1px solid ${COLORS.purple100}`,
            backgroundColor: COLORS.white,
            appearance: "none",
            WebkitAppearance: "none",
          }}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.value}
            </option>
          ))}
        </Box>
        <Box
          sx={{
            position: "absolute",
            right: "6px",
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            transform: "rotate(90deg)",
          }}
        >
          <ChevronRightIcon size={12} fill={COLORS.gray700} />
        </Box>
      </Box>
    </Box>
  )
}
