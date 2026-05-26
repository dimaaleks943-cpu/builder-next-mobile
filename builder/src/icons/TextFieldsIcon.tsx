import type { IIconProps } from "./interface.ts";

export const TextFieldsIcon = ({ size = 12, fill = "#727280" }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 2V3.6H3.63158V10H5.21053V3.6H7.84211V2H1ZM11 4.66667H6.26316V6.26667H7.84211V10H9.42105V6.26667H11V4.66667Z" fill={fill}/>
  </svg>
);
