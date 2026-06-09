import type { ReactNode } from "react"

interface Props {
  children?: ReactNode;
  className?: string;
  "data-craft-node-id"?: string;
}

export const NavbarLinks = ({
  children,
  className,
  "data-craft-node-id": dataCraftNodeId,
}: Props) => (
  <div className={className} data-craft-node-id={dataCraftNodeId}>
    {children}
  </div>
)
