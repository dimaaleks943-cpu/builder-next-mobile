import type { IIconProps } from "./interface.ts";

export const CopyIcon = ({ size = 20, fill = "#757575", }: IIconProps) => (
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.8421 3H5.26316C4.56842 3 4 3.57273 4 4.27273V13.1818H5.26316V4.27273H12.8421V3ZM14.7368 5.54545H7.78947C7.09474 5.54545 6.52632 6.11818 6.52632 6.81818V15.7273C6.52632 16.4273 7.09474 17 7.78947 17H14.7368C15.4316 17 16 16.4273 16 15.7273V6.81818C16 6.11818 15.4316 5.54545 14.7368 5.54545ZM14.7368 15.7273H7.78947V6.81818H14.7368V15.7273Z" fill={fill}/>
  </svg>
);
