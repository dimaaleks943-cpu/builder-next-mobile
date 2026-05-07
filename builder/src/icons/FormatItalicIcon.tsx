import type { IIconProps } from "./interface";

export const FormatItalicIcon = ({ size = 16, fill = "#6C5DD3", }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.66667 3V5.14286H8.14L5.86 10.8571H4V13H9.33333V10.8571H7.86L10.14 5.14286H12V3H6.66667Z" fill={fill}/>
  </svg>
);
