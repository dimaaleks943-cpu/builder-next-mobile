import type { IIconProps } from "../../../../../icons/interface.ts"
import { COLORS } from "../../../../../theme/colors.ts"

const iconDefaults = { size: 14, fill: COLORS.gray700 }

export const FormSendToPlatformIcon = ({ size = iconDefaults.size, fill = iconDefaults.fill }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.5 10.5L10.5 3.5M10.5 3.5H6.125M10.5 3.5V7.875"
      stroke={fill}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const FormSendToEmailIcon = ({ size = iconDefaults.size, fill = iconDefaults.fill }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.625 4.375H11.375C11.7892 4.375 12.125 4.71079 12.125 5.125V9.625C12.125 10.0392 11.7892 10.375 11.375 10.375H2.625C2.21079 10.375 1.875 10.0392 1.875 9.625V5.125C1.875 4.71079 2.21079 4.375 2.625 4.375Z"
      stroke={fill}
      strokeWidth="1.1"
      strokeLinejoin="round"
    />
    <path
      d="M2.625 5.125L7 8.3125L11.375 5.125"
      stroke={fill}
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const FormSendToWebhookIcon = ({ size = iconDefaults.size, fill = iconDefaults.fill }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="3.5" cy="10.5" r="1.25" stroke={fill} strokeWidth="1.1" />
    <circle cx="10.5" cy="10.5" r="1.25" stroke={fill} strokeWidth="1.1" />
    <circle cx="7" cy="3.5" r="1.25" stroke={fill} strokeWidth="1.1" />
    <path d="M4.5 9.375L6.125 4.875M9.5 9.375L7.875 4.875" stroke={fill} strokeWidth="1.1" strokeLinecap="round" />
  </svg>
)

export const FormSendToCustomActionIcon = ({ size = iconDefaults.size, fill = iconDefaults.fill }: IIconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8.75 2.625L11.375 5.25L5.6875 10.9375H3.0625V8.3125L8.75 2.625Z"
      stroke={fill}
      strokeWidth="1.1"
      strokeLinejoin="round"
    />
    <path d="M7.4375 4.375L9.625 6.5625" stroke={fill} strokeWidth="1.1" strokeLinecap="round" />
  </svg>
)
