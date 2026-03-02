import type { IIconProps } from "./interface.ts";


export const UpdateIcon = ({ size = 20, fill = "#6C5DD3" }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14.9425 5.05625C13.6729 3.7875 11.9306 3 9.99562 3C6.1257 3 3 6.1325 3 10C3 13.8675 6.1257 17 9.99562 17C13.2614 17 15.9844 14.7688 16.7636 11.75H14.9425C14.2245 13.7887 12.2808 15.25 9.99562 15.25C7.09756 15.25 4.74234 12.8962 4.74234 10C4.74234 7.10375 7.09756 4.75 9.99562 4.75C11.449 4.75 12.7448 5.35375 13.6904 6.3075L10.8712 9.125H17V3L14.9425 5.05625Z"
      fill={fill}/>
  </svg>
)
