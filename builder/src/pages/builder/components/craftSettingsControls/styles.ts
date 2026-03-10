import { Box, styled } from "@mui/material";
import { COLORS } from "../../../../theme/colors.ts";

export const Triangle = styled(Box)(() => ({
  position: "absolute",
  width: 0,
  height: 0,
  borderLeft: "4px solid transparent",
  borderRight: "4px solid transparent",
  borderTop: `6px solid ${COLORS.gray700}`,
  transform: "rotate(180deg)",
}));
