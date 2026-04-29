import { COLORS } from "../theme/colors.ts";
import type { IIconProps } from "./interface.ts";

export const ChevronDownIcon = ({ size = 24, fill = COLORS.black }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.41 8L12 12.3266L16.59 8L18 9.33198L12 15L6 9.33198L7.41 8Z" fill={fill} />
  </svg>
);
