import type { IIconProps } from "./interface";

export const FormatOverlinedIcon = ({ size = 16, fill = "#6C5DD3", }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.90978 14C10.274 14 12.1954 12.1932 12.1954 9.98657V4.65324H10.4097V9.98657C10.4097 11.2732 9.28832 12.3199 7.90978 12.3199C6.53124 12.3199 5.40984 11.2732 5.40984 9.98657V4.65324H3.62417V9.98657C3.62417 12.1932 5.54555 14 7.90978 14ZM2.90039 2V3.3H12.9V2H2.90039Z" fill={fill}/>
  </svg>
);
