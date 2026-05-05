import { TopLeftIcon } from "../../../../icons/TopLeftIcon.tsx";
import { COLORS } from "../../../../theme/colors.ts";
import { Box } from "@mui/material";
import { LeftIcon } from "../../../../icons/LeftIcon.tsx";
import { FullIcon } from "../../../../icons/FullIcon.tsx";

export const INSET_OPTIONS: {
  id: string
  value: string
  icon: JSX.Element
}[] = [
  { id: "1", value: "0% auto auto 0%", icon: <TopLeftIcon size={14} fill={COLORS.purple400}/> },
  {
    id: "2",
    value: "0% 0% auto auto",
    icon: (
      <Box sx={{ display: "flex", transform: "scaleX(-1)" }}>
        <TopLeftIcon size={14} fill={COLORS.purple400}/>
      </Box>
    ),
  },
  {
    id: "3",
    value: "auto auto 0% 0%",
    icon: (
      <Box sx={{ display: "flex", transform: "scaleY(-1)" }}>
        <TopLeftIcon size={14} fill={COLORS.purple400}/>
      </Box>
    ),
  },
  {
    id: "4",
    value: "auto 0% 0% auto",
    icon: (
      <Box sx={{ display: "flex", transform: "scale(-1)" }}>
        <TopLeftIcon size={14} fill={COLORS.purple400}/>
      </Box>
    ),
  },
  { id: "5", value: "0% auto 0% 0%", icon: <LeftIcon size={14} fill={COLORS.purple400}/> },
  {
    id: "6",
    value: "0% 0% 0% auto",
    icon: (
      <Box sx={{ display: "flex", transform: "scaleX(-1)" }}>
        <LeftIcon size={14} fill={COLORS.purple400}/>
      </Box>
    ),
  },
  {
    id: "7",
    value: "auto 0% 0%",
    icon: (
      <Box sx={{ display: "flex", transform: "rotate(90deg) scaleY(-1)" }}>
        <LeftIcon size={14} fill={COLORS.purple400}/>
      </Box>
    ),
  },
  {
    id: "8",
    value: "0% 0% auto",
    icon: (
      <Box sx={{ display: "flex", transform: "rotate(90deg)" }}>
        <LeftIcon size={14} fill={COLORS.purple400}/>
      </Box>
    ),
  },
  { id: "9", value: "0%", icon: <FullIcon size={14} fill={COLORS.purple400}/> },
]
