import { Box, Paper, Popper, Typography } from "@mui/material"
import type { ChangeEvent, MouseEvent as ReactMouseEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { COLORS } from "../../../../theme/colors.ts"
import { CraftSettingsStyleResetFooter } from "./CraftSettingsStyleResetFooter.tsx"

interface Props {
  label: string;
  type?: "text" | "number";
  value: string | number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  customStyles?: Record<string, unknown>;
  placeholder?: string;
  hideLabel?: boolean;
  /** Inside the bordered shell, right-aligned (muted). Shell matches value-with-unit fields. */
  suffix?: string;
  min?: number;
  disabled?: boolean;
  labelReset?: {
    hasValue: boolean;
    onReset: () => void;
  };
  /** @see CraftSettingsSelect.disableResetPopperPortal */
  disableResetPopperPortal?: boolean;
}

export const CraftSettingsInput = ({
  label,
  type = "text",
  value,
  onChange,
  customStyles,
  placeholder,
  hideLabel = false,
  suffix,
  min,
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

  const labelTypographySx = {
    width: "48px",
    minWidth: "48px",
    flexShrink: 0,
    fontSize: "10px",
    lineHeight: "14px",
    color: COLORS.gray700,
    textAlign: "left" as const,
  }

  const renderLabel = () => {
    if (hideLabel) return null
    if (!labelReset) {
      return (
        <Typography sx={labelTypographySx}>
          {label}
        </Typography>
      )
    }
    if (!labelReset.hasValue) {
      return (
        <Typography sx={labelTypographySx}>
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
            ...labelTypographySx,
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
          disablePortal={disableResetPopperPortal}
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
            <CraftSettingsStyleResetFooter onReset={handleFooterReset}/>
          </Paper>
        </Popper>
      </>
    )
  }

  const control = suffix ? (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        boxSizing: "border-box",
        borderRadius: "4px",
        border: `1px solid ${COLORS.purple100}`,
        backgroundColor: COLORS.white,
        paddingLeft: "4px",
        paddingRight: "4px",
        ...(disabled
          ? { opacity: 0.55, pointerEvents: "none" }
          : {
              "&:focus-within": {
                borderColor: COLORS.purple400,
              },
            }),
      }}
    >
      <Box
        component="input"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        {...(min !== undefined ? { min } : {})}
        aria-label={hideLabel ? label : undefined}
        sx={{
          border: "none",
          outline: "none",
          backgroundColor: "transparent",
          padding: "6px 0",
          fontSize: "12px",
          lineHeight: "14px",
          color: "inherit",
          width: "100%",
          minWidth: 0,
        }}
      />
      <Typography
        sx={{
          flexShrink: 0,
          fontSize: "10px",
          lineHeight: "14px",
          fontWeight: 400,
          color: COLORS.gray500,
        }}
      >
        {suffix}
      </Typography>
    </Box>
  ) : (
    <Box
      component="input"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      {...(min !== undefined ? { min } : {})}
      aria-label={hideLabel ? label : undefined}
      sx={{
        flex: 1,
        minWidth: 0,
        boxSizing: "border-box",
        padding: "6px 8px",
        fontSize: "12px",
        lineHeight: "14px",
        borderRadius: "4px",
        border: `1px solid ${COLORS.purple100}`,
        backgroundColor: COLORS.white,
        ...(disabled ? { opacity: 0.55, pointerEvents: "none" } : {}),
      }}
    />
  )

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        columnGap: "8px",
        ...(hideLabel ? { width: "100%" } : {}),
        ...customStyles,
      }}
    >
      {renderLabel()}
      {control}
    </Box>
  )
}
