import { Box } from "@mui/material"
import type { ReactNode } from "react"
import { COLORS } from "../../../../theme/colors.ts"
import { CraftSettingsResetLabelWithPopper } from "./CraftSettingsResetLabelWithPopper.tsx"
import { CraftSettingsFixedLabel } from "./styles.ts"

interface Option {
  id: string
  content: ReactNode
  disabled?: boolean
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
  /** @see CraftSettingsResetLabelWithPopper buttonToggle disableResetPopperPortal */
  disableResetPopperPortal?: boolean;
}

export const CraftSettingsButtonGroup = ({
  label,
  value,
  options,
  onChange,
  withoutLabel = false,
  onReset,
  resetLabelActive,
  disableResetPopperPortal = false,
}: Props) => {
  const resetEnabled = Boolean(onReset) && !withoutLabel
  const hasResettableValue =
    resetLabelActive !== undefined
      ? resetLabelActive
      : value !== undefined && String(value).trim() !== ""

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
      {!withoutLabel && resetEnabled ? (
        <CraftSettingsResetLabelWithPopper
          kind="buttonToggle"
          label={label}
          withoutLabel={withoutLabel}
          onReset={onReset}
          hasResettableValue={hasResettableValue}
          disableResetPopperPortal={disableResetPopperPortal}
        />
      ) : null}
      {!withoutLabel && !resetEnabled ? (
        <CraftSettingsFixedLabel>{label}</CraftSettingsFixedLabel>
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
              disabled={option.disabled}
              onClick={() => {
                if (option.disabled) return
                onChange(option.id)
              }}
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "5px 7px",
                borderRadius: "2px",
                border: "none",
                cursor: option.disabled ? "not-allowed" : "pointer",
                fontSize: "10px",
                lineHeight: "14px",
                color: COLORS.purple400,
                backgroundColor: isActive ? COLORS.white : COLORS.purple100,
                opacity: option.disabled ? 0.45 : 1,
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
