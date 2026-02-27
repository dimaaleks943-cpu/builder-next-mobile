import { Box, Typography } from "@mui/material"
import type { ReactNode } from "react"
import { COLORS } from "../../../../theme/colors.ts"

interface Option {
  id: string;
  content: ReactNode;
}

interface Props {
  label: string;
  values: string[];
  options: Option[];
  onChange: (next: string[]) => void;
}

export const CraftSettingsMultiToggleGroup = ({
  label,
  values,
  options,
  onChange,
}: Props) => {
  const handleClick = (id: string) => {
    const isActive = values.includes(id)
    const next = isActive ? values.filter((item) => item !== id) : [...values, id]
    onChange(next)
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <Typography
        sx={{
          minWidth: "48px",
          fontSize: "10px",
          lineHeight: "14px",
          color: COLORS.gray700,
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          backgroundColor: COLORS.purple100,
          padding: "1px",
        }}
      >
        {options.map((option) => {
          const isActive = values.includes(option.id)

          return (
            <Box
              key={option.id}
              component="button"
              type="button"
              onClick={() => handleClick(option.id)}
              sx={{
                width: "28px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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

