import { Box, Typography } from "@mui/material"
import type { ChangeEvent } from "react"
import { COLORS } from "../../../../theme/colors.ts"

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const CraftSettingsColorField = ({ label, value, onChange }: Props) => {
  const handlePickerChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
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
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
          padding: "4px 8px",
          borderRadius: "4px",
          border: `1px solid ${COLORS.purple100}`,
          backgroundColor: COLORS.white,
          gap: "6px",
        }}
      >
        <Box
          sx={{
            width: "12px",
            height: "12px",
            borderRadius: "2px",
            border: `1px solid ${COLORS.gray300}`,
            backgroundColor: value || COLORS.black,
            position: "relative",
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          <Box
            component="input"
            type="color"
            value={value}
            onChange={handlePickerChange}
            sx={{
              width: "18px",
              height: "18px",
              position: "absolute",
              inset: 0,
              opacity: 0,
              cursor: "pointer",
              padding: 0,
              border: "none",
            }}
          />
        </Box>
        <Box
          component="input"
          type="text"
          value={value}
          onChange={handleTextChange}
          sx={{
            flex: 1,
            minWidth: 0,
            width: 0,
            boxSizing: "border-box",
            border: "none",
            outline: "none",
            padding: 0,
            fontSize: "12px",
            lineHeight: "14px",
            color: COLORS.black,
          }}
        />
      </Box>
    </Box>
  )
}

