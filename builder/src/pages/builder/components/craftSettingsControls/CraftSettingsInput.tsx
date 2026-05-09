import { Box, Typography } from "@mui/material"
import type { ChangeEvent } from "react"
import { COLORS } from "../../../../theme/colors.ts"

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
        "&:focus-within": {
          borderColor: COLORS.purple400,
        },
      }}
    >
      <Box
        component="input"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
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
      {hideLabel ? null : (
        <Typography
          sx={{
            width: "48px",
            minWidth: "48px",
            flexShrink: 0,
            fontSize: "10px",
            lineHeight: "14px",
            color: COLORS.gray700,
            textAlign: "left",
          }}
        >
          {label}
        </Typography>
      )}
      {control}
    </Box>
  )
}
