import type { IIconProps } from "./interface.ts";

export const ClearIcon = ({ size = 16, fill = "#6C5DD3" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 5H3V3H13L13 5Z" fill={fill}/>
      <path
        d="M8.5 5V10.31H11.7049L10.4957 9.31827L11.1566 8.71406L13.5 10.8566L11.1566 12.9992L10.4957 12.395L11.7049 11.2852H7.5V5H8.5Z"
        fill={fill}/>
      <path
        d="M7.5 5V10.31H4.29508L5.5043 9.31827L4.84344 8.71406L2.5 10.8566L4.84344 12.9992L5.5043 12.395L4.29508 11.2852H8.5V5H7.5Z"
        fill={fill}/>
    </svg>
  );
};
