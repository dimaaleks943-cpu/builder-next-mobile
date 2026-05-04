import type { IIconProps } from "./interface.ts";

export const PositionLeftIcon = ({ width = 24, height = 16, fill = "#6C5DD3" }: IIconProps) => {
  return (
    <svg width={width} height={height} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="8" height="8" fill={fill} />
      <path d="M12 13H17V11H12L12 13ZM12 9H22V6.9959H12V9ZM12 5H22V3H12L12 5Z" fill="#6C5DD3"/>
    </svg>
  );
};
