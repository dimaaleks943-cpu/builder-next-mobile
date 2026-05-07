import type { IIconProps } from "./interface";

export const FormatUnderlinedIcon = ({ size = 16, fill = "#6C5DD3", }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 11.3333C10.3643 11.3333 12.2857 9.54 12.2857 7.33333V2H10.5V7.33333C10.5 8.62 9.37857 9.66667 8 9.66667C6.62143 9.66667 5.5 8.62 5.5 7.33333V2H3.71429V7.33333C3.71429 9.54 5.63571 11.3333 8 11.3333ZM3 12.6667V14H13V12.6667H3Z" fill={fill}/>
  </svg>
);
