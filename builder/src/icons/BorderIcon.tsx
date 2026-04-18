import type { IIconProps } from "./interface.ts";

export const BorderIcon = ({ size = 16, fill = "#6C5DD3" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M10.5 4.25H5.5C4.80964 4.25 4.25 4.80964 4.25 5.5V10.5C4.25 11.1904 4.80964 11.75 5.5 11.75H10.5C11.1904 11.75 11.75 11.1904 11.75 10.5V5.5C11.75 4.80964 11.1904 4.25 10.5 4.25ZM5.5 3C4.11929 3 3 4.11929 3 5.5V10.5C3 11.8807 4.11929 13 5.5 13H10.5C11.8807 13 13 11.8807 13 10.5V5.5C13 4.11929 11.8807 3 10.5 3H5.5Z" fill={fill}/>
    </svg>
  );
};
