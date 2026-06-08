import { COLORS } from "../theme/colors"

interface Props {
  fill?: string
}

export const BurgerIcon = ({ fill = COLORS.purple400 }: Props) => (
  <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.5 24H27.5V20H0.5V24ZM0.5 14H27.5V10H0.5V14ZM0.5 0V4H27.5V0H0.5Z" fill={fill} />
  </svg>
)
