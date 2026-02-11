import { Box, Typography } from "@mui/material"
import { COLORS } from "../../../theme/colors"

export const BuilderCanvas = () => {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.gray100,
      }}
    >
      {/* Панель действий над холстом (undo/redo и т.п.) */}
      <Box
        sx={{
          height: "28px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          borderBottom: `1px solid ${COLORS.gray200}`,
          backgroundColor: COLORS.white,
        }}
      >
        <Typography variant="body2" color={COLORS.gray600}>
          ↶ ↷
        </Typography>
      </Box>

      {/* Сам холст */}
      <Box
        sx={{
          flex: 1,
          padding: "0 8px 8px",
          display: "flex",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundColor: COLORS.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body1" color={COLORS.gray600}>
            Здесь будет холст страницы.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

