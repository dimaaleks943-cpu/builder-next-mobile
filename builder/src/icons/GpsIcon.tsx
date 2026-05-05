import type { IIconProps } from "./interface.ts";

export const GpsIcon = ({ size = 12, fill = "#A2A2A2" }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="gps">
      <path id="icon/device/gps_not_fixed_24px" d="M6.4541 1V1.93652C8.34956 2.14561 9.85439 3.65044 10.0635 5.5459H11V6.4541H10.0635C9.85439 8.34956 8.34956 9.85439 6.4541 10.0635V11H5.5459V10.0635C3.65044 9.85439 2.14561 8.34956 1.93652 6.4541H1V5.5459H1.93652C2.14561 3.65044 3.65044 2.14561 5.5459 1.93652V1H6.4541ZM6 3C4.34143 3 3 4.34143 3 6C3 7.65857 4.34143 9 6 9C7.65857 9 9 7.65857 9 6C9 4.34143 7.65857 3 6 3Z" fill={fill}/>
    </g>
  </svg>
);
