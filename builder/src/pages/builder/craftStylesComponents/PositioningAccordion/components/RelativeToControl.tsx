import { Box, Typography } from "@mui/material"
import { COLORS } from "../../../../../theme/colors.ts"
import { GpsIcon } from "../../../../../icons/GpsIcon.tsx"

interface Props {
  label: string;
  value: string;
  onClick?: () => void;
}

export const RelativeToControl = ({ label, value, onClick }: Props) => {
  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      rowGap: "2px",
      alignItems: "center"
    }}>
      <Box
        component="button"
        type="button"
        onClick={onClick}
        disabled={!onClick}
        sx={{
          border: `1px solid ${COLORS.purple100}`,
          borderRadius: "4px",
          backgroundColor: COLORS.white,
          padding: "6px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          cursor: onClick ? "pointer" : "default",
          textAlign: "left",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
          <GpsIcon size={14} fill={COLORS.gray500}/>
          <Typography
            sx={{
              fontSize: "12px",
              lineHeight: "14px",
              color: COLORS.gray700,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </Typography>
        </Box>

      </Box>
      <Typography sx={{ fontSize: "8px", lineHeight: "10px", color: COLORS.gray700 }}>
        {label}
      </Typography>
    </Box>
  )
}

