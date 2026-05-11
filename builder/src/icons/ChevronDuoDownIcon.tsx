import type { IIconProps } from "./interface.ts";

export const ChevronDuoDownIcon = ({ size = 16, fill = "#6C5DD3" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.99983 12.2808L3.99316 8.27418L4.93583 7.33084L8.0025 10.3975L11.0692 7.33084L12.0065 8.27418L8.0005 12.2808H7.99983ZM7.99983 8.66484L3.99316 4.65751L4.93583 3.71484L8.0025 6.78151L11.0692 3.71484L12.0065 4.65751L8.0005 8.66418L7.99983 8.66484Z" fill={fill}/>
    </svg>
  );
};
