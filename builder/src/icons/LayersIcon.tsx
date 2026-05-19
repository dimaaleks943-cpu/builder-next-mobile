import type { IIconProps } from "./interface.ts";

export const LayersIcon = ({ size = 20, fill = "#1B1D21" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 17L3 12.6522L4.26 11.8696L9.99222 15.4286L15.7322 11.864L17 12.6522L10 17ZM10 14.3478L3 10L4.26 9.21739L9.99222 12.7764L15.7322 9.21118L17 10L10 14.3478ZM10 11.6957L4.26778 8.13665L3 7.34783L10 3L17 7.34783L15.7244 8.13665L10 11.6957Z" fill={fill}/>
    </svg>
  );
};
