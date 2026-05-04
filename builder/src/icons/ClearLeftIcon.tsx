import type { IIconProps } from "./interface.ts";

export const ClearLeftIcon = ({ size = 16, fill = "#6C5DD3" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 5H13V3H3L3 5Z" fill="#BFB9E8"/>
      <rect x="6" y="3" width="7" height="2" fill={fill}/>
      <path d="M9 5V10.31H4.79508L6.0043 9.31827L5.34344 8.71406L3 10.8566L5.34344 12.9992L6.0043 12.395L4.79508 11.2852H10V5H9Z" fill="#6C5DD3"/>
    </svg>

  );
};
