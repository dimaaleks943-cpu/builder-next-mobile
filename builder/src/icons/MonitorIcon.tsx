import type { IIconProps } from "./interface.ts";

export const MonitorIcon = ({ size = 20, fill = `#2D2D2F` }: IIconProps) => (
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.6364 17H6.36364V15.4444H7.81818V14.6667H3.45455C2.65122 14.6667 2 13.9702 2 13.1111V4.55556C2 3.69645 2.65122 3 3.45455 3H16.5455C17.3488 3 18 3.69645 18 4.55556V13.1111C18 13.9702 17.3488 14.6667 16.5455 14.6667H12.1818V15.4444H13.6364V17ZM3.45455 4.55556V13.1111H16.5455V4.55556H3.45455Z" fill={fill}/>
  </svg>

)
