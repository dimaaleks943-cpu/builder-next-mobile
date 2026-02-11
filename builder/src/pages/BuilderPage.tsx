import { Box, IconButton, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { COLORS } from "../theme/colors"

export const BuilderPage = () => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: (theme) => theme.zIndex.modal + 1,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.gray100,
      }}
    >
      {/* Верхняя панель конструктора (можно потом вынести в общий layout) */}
      <Box
        sx={{
          flexShrink: 0,
          height: "44px",
          padding: "12px 8px",
          display: "flex",
          alignItems: "center",
          backgroundColor: COLORS.white,
          borderBottom: `1px solid ${COLORS.purple100}`,
          boxSizing: "border-box",
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ padding: 0 }}
        >
          {"<="}
        </IconButton>
      </Box>

      {/* Рабочая область конструктора — занимает всю оставшуюся ширину и высоту */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          backgroundColor: COLORS.white,
        }}
      >
        {/* Здесь позже появятся панель компонентов / холст / панель настроек */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
          }}
        >
          <Typography variant="body1">
            Здесь будет конструктор страниц (полная ширина экрана).
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

