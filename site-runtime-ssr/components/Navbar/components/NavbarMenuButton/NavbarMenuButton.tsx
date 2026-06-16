import type { ReactNode } from "react"
import { useNavbarMenu } from "@/lib/navbar/navbarMenuContext"

interface Props {
  children?: ReactNode;
  className?: string;
  "data-craft-node-id"?: string;
  htmlId?: string;
}

export const NavbarMenuButton = ({
  children,
  className,
  "data-craft-node-id": dataCraftNodeId,
  htmlId,
}: Props) => {
  const { isMenuOpen, toggleMenu } = useNavbarMenu()

  return (
    <div
      className={className}
      data-craft-node-id={dataCraftNodeId}
      {...(htmlId ? { id: htmlId } : {})}
      role="button"
      tabIndex={0}
      aria-label="menu"
      aria-haspopup="menu"
      aria-expanded={isMenuOpen}
      onClick={toggleMenu}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          toggleMenu()
        }
      }}
    >
      {children}
    </div>
  )
}
