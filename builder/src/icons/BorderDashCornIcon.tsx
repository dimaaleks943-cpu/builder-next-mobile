import type { IIconProps } from "./interface.ts";

export const BorderDashCornIcon = ({ size = 12, fill = "#A2A2A2" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.5 7.00184C8.5 4.52832 6.22419 3.5 5 3.5L2 3.5L2 2L5 2C7.76142 2 10 4.2394 10 7.00184L10 10L8.5 10L8.5 7.00184Z" fill={fill}/>
    </svg>
  );
};
