import type { IIconProps } from "./interface.ts";

export const MinusIcon = ({ size = 20, fill = "#6C5DD3" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 11H3V9H17V11Z" fill={fill} />
    </svg>
  );
};
