import type { MouseEvent, ReactNode } from "react"
import { ActionButton } from "./styles.ts"

interface Props {
  children: ReactNode
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  startIcon?: ReactNode
}

export const SettingsActionButton = ({
  children,
  onClick,
  type = "button",
  disabled,
  startIcon,
}: Props) => (
  <ActionButton type={type} onClick={onClick} disabled={disabled}>
    {startIcon}
    {children}
  </ActionButton>
)
