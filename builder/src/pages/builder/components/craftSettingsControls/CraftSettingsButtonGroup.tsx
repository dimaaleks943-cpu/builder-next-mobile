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
      sx={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}
    >
      {!withoutLabel && <Typography
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
      </Typography>}
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

