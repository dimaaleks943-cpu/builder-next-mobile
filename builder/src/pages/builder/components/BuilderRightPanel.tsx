import { Box, Typography } from "@mui/material"
import { COLORS } from "../../../theme/colors"

export const BuilderRightPanel = () => {
  return (
    <Box
      sx={{
        width: 320,
        borderLeft: `1px solid ${COLORS.gray200}`,
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
          Панель свойств
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
        }}
      >
        {/* TODO: настройки выбранного элемента (стили, позиционирование и т.д.) */}
      </Box>
    </Box>
  )
}

