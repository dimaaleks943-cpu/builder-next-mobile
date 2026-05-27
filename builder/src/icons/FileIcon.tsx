import type { IIconProps } from "./interface.ts";

export const FileIcon = ({ size = 24 }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.75 3C5.7875 3 5.00875 3.81 5.00875 4.8L5 19.2C5 20.19 5.77875 21 6.74125 21H17.25C18.2125 21 19 20.19 19 19.2V8.4L13.75 3H6.75ZM12.875 9.3V4.35L17.6875 9.3H12.875Z"
      fill="currentColor"/>
  </svg>
)
