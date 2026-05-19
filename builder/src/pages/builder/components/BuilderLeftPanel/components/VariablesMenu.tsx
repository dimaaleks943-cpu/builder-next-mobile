import { Box } from "@mui/material"
import { COLORS } from "../../../../../theme/colors.ts"

interface Props {
  onClose: () => void
}

export const VariablesMenu = (_props: Props) => {
  return (
    <Box
      sx={{
        width: 280,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${COLORS.gray200}`,
        backgroundColor: COLORS.secondaryVeryLightGray,
      }}
    >
      <Box
        sx={{
          paddingTop: "12px",
          paddingRight: "8px",
          paddingBottom: "12px",
          paddingLeft: "8px",
          color: COLORS.black,
          fontWeight: 700,
          fontSize: "14px",
          lineHeight: "20px",
        }}
      >
        Переменные
      </Box>

      <Box
        sx={{
          flex: 1,
          padding: "8px",
          overflowY: "auto",
          fontSize: "12px",
          color: COLORS.gray600,
        }}
      >
        Раздел в разработке.
      </Box>
    </Box>
  )
}
