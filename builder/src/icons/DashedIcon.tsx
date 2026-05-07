import type { IIconProps } from "./interface.ts";

export const DashedIcon = ({ size = 16, fill = "#6C5DD3" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7.25H5.66667V8.75H3V7.25Z" fill="#6C5DD3"/>
      <path d="M6.66667 7.25H9.33333V8.75H6.66667V7.25Z" fill="#6C5DD3"/>
      <path d="M10.3333 7.25H13V8.75H10.3333V7.25Z" fill={fill}/>
    </svg>

  );
};
