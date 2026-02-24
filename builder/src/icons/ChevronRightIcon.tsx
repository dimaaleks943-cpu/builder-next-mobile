import type { IIconProps } from "./interface.ts";

export const ChevronRightIcon = ({ size = 24, fill = "#757575" }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.125 17.355L13.0697 12L8.125 6.645L9.64727 5L16.125 12L9.64727 19L8.125 17.355Z" fill={fill} />
  </svg>
);
