import { Box, Typography } from "@mui/material"
import { COLORS } from "../../../theme/colors"

export const BuilderLeftPanel = () => {
  return (
    <Box
      sx={{
        width: 280,
        borderRight: `1px solid ${COLORS.gray200}`,
        backgroundColor: COLORS.secondaryVeryLightGray,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          padding: "12px 16px",
          borderBottom: `1px solid ${COLORS.gray200}`,
        }}
      >
        <Typography variant="subtitle2" color={COLORS.gray700}>
          Блоки
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
        }}
      >
        {/* TODO: список блоков/элементов конструктора */}
      </Box>
    </Box>
  )
}

