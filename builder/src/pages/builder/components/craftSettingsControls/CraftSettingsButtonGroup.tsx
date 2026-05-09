import { useEffect, useRef, useState } from "react"
import { Box, Paper, Popper, Typography } from "@mui/material"
import type { ReactNode } from "react"
import { COLORS } from "../../../../theme/colors.ts"
import { CraftSettingsStyleResetFooter } from "./CraftSettingsStyleResetFooter.tsx"

interface Option {
  id: string;
  content: ReactNode;
}

interface Props {
  label: string;
  value: string | undefined;
  options: Option[];
  onChange: (id: string) => void;
  withoutLabel?: boolean;
  /** When set, clicking the label opens a popover with {@link CraftSettingsStyleResetFooter}. */
  onReset?: () => void;
  /**
   * When set with {@link onReset}, controls purple reset affordance on the label.
   * Use when {@link value} is always defined for UI (e.g. default "clip") but reset should reflect an explicit craft style only.
   */
  resetLabelActive?: boolean;
}

export const CraftSettingsButtonGroup = ({
  label,
  value,
  options,
  onChange,
  withoutLabel = false,
  onReset,
  resetLabelActive,
}: Props) => {
  const [resetAnchorEl, setResetAnchorEl] = useState<HTMLElement | null>(null)
  const resetPaperRef = useRef<HTMLDivElement | null>(null)
  const resetEnabled = Boolean(onReset) && !withoutLabel
  const hasResettableValue =
    resetLabelActive !== undefined
      ? resetLabelActive
      : value !== undefined && String(value).trim() !== ""

  useEffect(() => {
    if (!resetEnabled || !resetAnchorEl) return
    const onDocMouseDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (resetAnchorEl.contains(target)) return
      if (resetPaperRef.current?.contains(target)) return
      setResetAnchorEl(null)
    }
    document.addEventListener("mousedown", onDocMouseDown, true)
    return () => document.removeEventListener("mousedown", onDocMouseDown, true)
  }, [resetEnabled, resetAnchorEl])

  const labelSx = {
    width: "48px",
    minWidth: "48px",
    flexShrink: 0,
    fontSize: "10px",
    lineHeight: "14px",
    color: COLORS.gray700,
    textAlign: "left" as const,
  }

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}
    >
      {!withoutLabel && resetEnabled ? (
        <>
          <Typography
            component="button"
            type="button"
            onClick={(event) => {
              setResetAnchorEl((prev) =>
                prev ? null : event.currentTarget,
              )
            }}
            sx={{
              ...labelSx,
              color: hasResettableValue ? COLORS.purple400 : COLORS.gray700,
              cursor: hasResettableValue ? "pointer" : "default",
              border: "none",
              backgroundColor: "transparent",
              padding: 0,
              fontFamily: "inherit",
              ...(hasResettableValue
                ? { "&:hover": { color: COLORS.purple400 } }
                : {}),
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
                boxSizing: "border-box",
              }}
            >
              <CraftSettingsStyleResetFooter
                onReset={() => {
                  onReset?.()
                  setResetAnchorEl(null)
                }}
              />
            </Paper>
          </Popper>
        </>
      ) : null}
      {!withoutLabel && !resetEnabled ? (
        <Typography sx={labelSx}>{label}</Typography>
      ) : null}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          backgroundColor: COLORS.purple100,
          padding: "1px",
        }}
      >
        {options.map((option) => {
          const isActive = option.id === value

          return (
            <Box
              key={option.id}
              component="button"
              type="button"
              onClick={() => onChange(option.id)}
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "5px 7px",
                borderRadius: "2px",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                color: COLORS.purple400,
                backgroundColor: isActive ? COLORS.white : COLORS.purple100,
              }}
            >
              {option.content}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
