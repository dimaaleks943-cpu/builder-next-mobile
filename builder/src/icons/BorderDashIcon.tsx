import type { IIconProps } from "./interface.ts";

export const BorderDashIcon = ({ size = 16, fill = "#6C5DD3" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.49995 4.25C4.80961 4.25 4.24997 4.80964 4.24997 5.5V7H3V5.5C3 4.11929 4.11927 3 5.49995 3H6.99845V4.25H5.49995Z" fill={fill}/>
      <path d="M4.24997 10.5C4.24997 11.1904 4.80961 11.75 5.49995 11.75H6.99845V13H5.49995C4.11927 13 3 11.8807 3 10.5V9H4.24997V10.5Z" fill={fill}/>
      <path d="M10.4999 11.75C11.1902 11.75 11.7498 11.1904 11.7498 10.5V9H12.9998V10.5C12.9998 11.8807 11.8805 13 10.4999 13H9V11.75H10.4999Z" fill={fill}/>
      <path d="M11.7498 5.5C11.7498 4.80964 11.1902 4.25 10.4999 4.25H9V3H10.4999C11.8805 3 12.9998 4.11929 12.9998 5.5V7H11.7498V5.5Z" fill={fill}/>
    </svg>
  );
};
