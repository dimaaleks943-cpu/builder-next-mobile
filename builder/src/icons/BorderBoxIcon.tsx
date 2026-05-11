import type { IIconProps } from "./interface.ts";

export const BorderBoxIcon = ({ size = 16, fill = "none" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={fill} xmlns="http://www.w3.org/2000/svg">
      <rect x="3.5" y="3.5" width="9" height="9" stroke="#BFB9E8"/>
      <rect x="3.5" y="6.5" width="9" height="3" stroke="#6C5DD3"/>
    </svg>
  );
};
