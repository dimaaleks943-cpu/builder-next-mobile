import type { IIconProps } from "./interface.ts";

export const OverlayRoundedIcon = ({ size = 16, fill = "#6C5DD3" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="overlay">
        <path id="Path" d="M13.6004 12.354V3.64288C13.6004 2.95844 13.0404 2.39844 12.3559 2.39844H3.64483C2.96039 2.39844 2.40039 2.95844 2.40039 3.64288V12.354C2.40039 13.0384 2.96039 13.5984 3.64483 13.5984H12.3559C13.0404 13.5984 13.6004 13.0384 13.6004 12.354Z" fill={fill}/>
      </g>
    </svg>
  );
};
