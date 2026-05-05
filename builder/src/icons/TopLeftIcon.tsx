import type { IIconProps } from "./interface.ts";

export const TopLeftIcon = ({ size = 14, fill = "#6C5DD3" }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3.125" y="3.125" width="7.75" height="7.75" stroke="#BFB9E8"/>
    <rect x="3.125" y="3.125" width="3" height="3" fill={fill} stroke="#6C5DD3"/>
  </svg>
);
