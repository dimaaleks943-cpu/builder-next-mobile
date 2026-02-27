import { Box, Typography } from "@mui/material"
import type { ChangeEvent } from "react"
import { COLORS } from "../../../../theme/colors.ts"

interface Props {
  label: string;
  type?: "text" | "number";
  value: string | number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  customStyles?: any;
}

export const CraftSettingsInput = ({
  label,
  type = "text",
  value,
  onChange,
  customStyles
}: Props) => {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        columnGap: "8px",
        ...customStyles,
      }}
    >
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
      <Box
        component="input"
        type={type}
        value={value}
        onChange={onChange}
        sx={{
          width: "100%",
          flex: 4,
          boxSizing: "border-box",
          padding: "6px 8px",
          fontSize: "12px",
          lineHeight: "14px",
          borderRadius: "4px",
          border: `1px solid ${COLORS.purple100}`,
          backgroundColor: COLORS.white,
        }}
      />
    </Box>
  )
}

