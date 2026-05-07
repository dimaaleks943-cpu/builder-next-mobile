import type { IIconProps } from "./interface.ts";
import { COLORS } from "../theme/colors.ts";

export const DeleteIcon = ({
  size = 24,
  fill = COLORS.yellow400,
}: IIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
      fill={fill}
    />
  </svg>
);
