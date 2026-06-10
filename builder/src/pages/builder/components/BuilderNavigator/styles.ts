import { Box } from "@mui/material"
import { styled } from "@mui/material/styles"
import { COLORS } from "../../../../theme/colors.ts"

export const TREE_INDENT_STEP = 16

export const TreeChildrenGroup = styled(Box)({
  marginLeft: `${TREE_INDENT_STEP}px`,
  paddingLeft: "8px",
  borderLeft: `1px solid ${COLORS.gray200}`,
})
