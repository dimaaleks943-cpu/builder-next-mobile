import type { IIconProps } from "./interface.ts";

export const TileIcon = ({ size = 16, fill = "#6C5DD3" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9.25H5.5V6.75H3V9.25ZM6.75 9.25H9.25V6.75H6.75V9.25ZM10.5 9.25H13V6.75H10.5V9.25Z" fill={fill}/>
    </svg>
  );
};
