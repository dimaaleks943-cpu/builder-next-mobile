import type { IIconProps } from "./interface.ts";

export const ProblemIcon = ({ size = 20, fill = "#ED6F26" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 5.94L15.4764 15.5263H4.52364L10 5.94ZM10 3L2 17H18L10 3ZM10.7273 13.3158H9.27273V14.7895H10.7273V13.3158ZM10.7273 8.89474H9.27273V11.8421H10.7273V8.89474Z"
        fill={fill}/>
    </svg>
  )
}
