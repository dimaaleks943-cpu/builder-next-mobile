import { Box, Typography } from "@mui/material"
import type { ReactNode } from "react"
import { COLORS } from "../../../../theme/colors.ts"

interface Option {
  id: string;
  content: ReactNode;
}

interface Props {
  label: string;
  value: string;
  options: Option[];
  onChange: (id: string) => void;
  withoutLabel?: boolean;
}

export const CraftSettingsButtonGroup = ({
  label,
  value,
  options,
  onChange,
  withoutLabel = false,
}: Props) => {
  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: "8px" }}
    >
      {!withoutLabel && <Typography
        sx={{
          minWidth: "48px",
          fontSize: "10px",
          lineHeight: "14px",
          color: COLORS.gray700,
        }}
      >
        {label}
      </Typography>}
      <Box
        sx={{
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

