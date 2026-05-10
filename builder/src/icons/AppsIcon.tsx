import type { IIconProps } from "./interface.ts";

export const AppsIcon = ({ size = 16, fill = "#6C5DD3" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 5.5H5.5V3H3V5.5ZM6.75 13H9.25V10.5H6.75V13ZM3 13H5.5V10.5H3V13ZM3 9.25H5.5V6.75H3V9.25ZM6.75 9.25H9.25V6.75H6.75V9.25ZM10.5 3V5.5H13V3H10.5ZM6.75 5.5H9.25V3H6.75V5.5ZM10.5 9.25H13V6.75H10.5V9.25ZM10.5 13H13V10.5H10.5V13Z" fill={fill}/>
    </svg>
  );
};
