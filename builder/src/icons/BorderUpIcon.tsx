import type { IIconProps } from "./interface.ts";

export const BorderUpIcon = ({ size = 16, fill = "#BFB9E8" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.00033 5.33203V10.6654C4.00033 11.4017 4.59728 11.9987 5.33366 11.9987H10.667C11.4034 11.9987 12.0003 11.4017 12.0003 10.6654V5.33203H13.3337V10.6654C13.3337 12.1381 12.1398 13.332 10.667 13.332H5.33366C3.8609 13.332 2.66699 12.1381 2.66699 10.6654V5.33203H4.00033Z" fill={fill}/>
      <line x1="3" y1="3.25" x2="13" y2="3.25" stroke="#6C5DD3" strokeWidth="1.5"/>
    </svg>
  );
};
