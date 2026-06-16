import type { ReactNode } from "react"

interface Props {
  children?: ReactNode;
  className?: string;
  "data-craft-node-id"?: string;
  htmlId?: string;
}

export const NavbarLinks = ({
  children,
  className,
  "data-craft-node-id": dataCraftNodeId,
  htmlId,
}: Props) => (
  <div
    className={className}
    data-craft-node-id={dataCraftNodeId}
    {...(htmlId ? { id: htmlId } : {})}
  >
    {children}
  </div>
)
