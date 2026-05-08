import { Box, Typography } from "@mui/material"
import type { ChangeEvent } from "react"
import { COLORS } from "../../../../theme/colors.ts"
import { ChevronRightIcon } from "../../../../icons/ChevronRightIcon.tsx"

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
}

export const CraftSettingsSelect = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  showInlineLabel = true,
}: Props) => {
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
      {showInlineLabel ? (
        <Typography
          sx={{
            fontSize: "10px",
            lineHeight: "14px",
            color: COLORS.gray700,
            flex: 1,
          }}
        >
          {label}
        </Typography>
      ) : null}
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


