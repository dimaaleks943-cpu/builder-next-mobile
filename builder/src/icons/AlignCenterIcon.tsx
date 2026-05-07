import type { IIconProps } from "./interface.ts";

export const AlignCenterIcon = ({ size = 16, fill = "#6C5DD3" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.22222 9.66667V10.7778H10.7778V9.66667H5.22222ZM3 13H13V11.8889H3V13ZM3 8.55556H13V7.44444H3V8.55556ZM5.22222 5.22222V6.33333H10.7778V5.22222H5.22222ZM3 3V4.11111H13V3H3Z"
        fill={fill}/>
    </svg>
  );
};
