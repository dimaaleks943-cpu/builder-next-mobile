import { COLORS } from "../theme/colors.ts"
import type { IIconProps } from "./interface.ts"

export const ZigzagRightIcon = ({
  size = 16,
  fill = COLORS.purple400,
}: IIconProps) => (
  <svg width={size} height={size} viewBox={`0 0 16 16`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.4447 3L4.70423 10.637H9.48158V8.97165L13 10.9858L9.48158 13V11.3347H3L10.7405 3.69774H3.85212V3H12.4447Z" fill={fill}/>
  </svg>

)
