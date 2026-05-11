import { Box, Typography } from "@mui/material"
import type { ChangeEvent, FocusEvent, KeyboardEvent } from "react"
import { COLORS } from "../../../../theme/colors.ts"
import { CraftSettingsResetLabelWithPopper } from "./CraftSettingsResetLabelWithPopper.tsx"

interface Props {
  label: string;
  type?: "text" | "number";
  value: string | number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
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
  onBlur,
  onKeyDown,
  customStyles,
  placeholder,
  hideLabel = false,
  suffix,
  min,
  disabled = false,
  labelReset,
  disableResetPopperPortal = false,
}: Props) => {
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
        onBlur={onBlur}
        onKeyDown={onKeyDown}
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
      onBlur={onBlur}
      onKeyDown={onKeyDown}
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
      <CraftSettingsResetLabelWithPopper
        kind="labelReset"
        label={label}
        hidden={hideLabel}
        variant="fixed"
        labelReset={labelReset}
        disableResetPopperPortal={disableResetPopperPortal}
      />
      {control}
    </Box>
  )
}
