import type { IIconProps } from "./interface.ts";

export const NavigationIcon = ({
  size = 20,
  fill = "#1B1D21",
}: IIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17 15H10V13.3333H17V15ZM17 10.8333H3V9.16667H17V10.8333ZM17 6.66667H3V5H17V6.66667Z"
      fill={fill}
    />
  </svg>
);
