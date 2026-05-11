import type { IIconProps } from "./interface.ts";

export const CropRoundedIcon = ({ size = 16, fill = "#6C5DD3" }: IIconProps) => {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="crop">
        <path id="icon/image/crop_24px" d="M5.27246 2V10.1816C5.27246 10.4816 5.51836 10.7275 5.81836 10.7275H14.001V11.8184H11.8184V14H10.7275V11.8184H5.27246C4.67278 11.8181 4.18189 11.3272 4.18164 10.7275V5.27246H2V4.18164H4.18164V2H5.27246ZM10.7275 4.18457C11.3276 4.18457 11.8193 4.6754 11.8193 5.27539V9.63867H10.7275V5.82031C10.7275 5.52044 10.4825 5.27549 10.1826 5.27539H6.36426V4.18457H10.7275Z" fill={fill}/>
      </g>
    </svg>
  );
};
