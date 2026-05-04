import type { IIconProps } from "./interface.ts"

export const CloseIcon = ({ size = 16, fill = "#6C5DD3" }: IIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 4L12 12M12 4L4 12"
      stroke={fill}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)
