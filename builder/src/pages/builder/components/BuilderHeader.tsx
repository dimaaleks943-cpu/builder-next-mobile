import { Box, IconButton } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { COLORS } from "../../../theme/colors"

export const BuilderHeader = () => {
  const navigate = useNavigate()

  return (
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
  )
}

