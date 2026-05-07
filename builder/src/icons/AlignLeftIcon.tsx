import type { IIconProps } from "./interface.ts";

export const AlignLeftIcon = ({ size = 16, fill = "#6C5DD3" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.66667 9.66667H3V10.7778H9.66667V9.66667ZM9.66667 5.22222H3V6.33333H9.66667V5.22222ZM3 8.55556H13V7.44444H3V8.55556ZM3 13H13V11.8889H3V13ZM3 3V4.11111H13V3H3Z" fill={fill}/>
    </svg>
  );
};
