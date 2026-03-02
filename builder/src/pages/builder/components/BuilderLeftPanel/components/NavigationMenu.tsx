import { Box } from "@mui/material"
import { COLORS } from "../../../../../theme/colors.ts"
import { BuilderNavigator } from "../../BuilderNavigator.tsx"

export const NavigationMenu = () => {
  return (
    <Box
      sx={{
        width: 280,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${COLORS.gray200}`,
        backgroundColor: COLORS.white,
      }}
    >
      <BuilderNavigator />
    </Box>
  )
}

