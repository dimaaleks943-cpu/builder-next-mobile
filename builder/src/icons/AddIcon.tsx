import type { IIconProps } from "./interface.ts";

export const AddIcon = ({ height = 20, width = 20, fill = "#6C5DD3" }: IIconProps) => {
  return (
    <svg width={width} height={height} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 11H11V17H9V11H3V9H9V3H11V9H17V11Z" fill={fill} />
    </svg>
  );
};
