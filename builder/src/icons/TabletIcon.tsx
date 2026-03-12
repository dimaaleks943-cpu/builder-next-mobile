import type { IIconProps } from "./interface.ts";

export const TabletIcon = ({ size = 20, fill = `#2D2D2F` }: IIconProps) => (
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.6 18H4.4C3.6268 18 3 17.3488 3 16.5455V3.45455C3 2.65122 3.6268 2 4.4 2H15.6C16.3732 2 17 2.65122 17 3.45455V16.5455C17 17.3488 16.3732 18 15.6 18ZM4.4 3.45455V16.5455H15.6V3.45455H4.4ZM10 15.8182C9.6134 15.8182 9.3 15.4926 9.3 15.0909C9.3 14.6892 9.6134 14.3636 10 14.3636C10.3866 14.3636 10.7 14.6892 10.7 15.0909C10.7 15.4926 10.3866 15.8182 10 15.8182Z" fill={fill}/>
  </svg>
)
