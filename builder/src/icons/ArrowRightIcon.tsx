import { COLORS } from "../theme/colors.ts";
import type { IIconProps } from "./interface.ts";

export const ArrowRightIcon = ({ size = 16, fill = COLORS.black }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.99999 2.21484L6.98026 3.23458L11.0158 7.27734L2.21428 7.27734L2.21428 8.72377L11.0158 8.72377L6.97303 12.7593L7.99999 13.7863L13.7857 8.00056L7.99999 2.21484Z"
      fill={fill}
    />
  </svg>
);
