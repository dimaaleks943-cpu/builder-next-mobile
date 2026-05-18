import type { ReactNode } from "react"

interface Props  {
  children?: ReactNode
  className?: string
  "data-craft-node-id"?: string
}

export const Body = ({
  children,
  className,
  "data-craft-node-id": dataCraftNodeId,
  // Responsive visual styles come from className CSS rules generated from props.style.*.
}: Props) => {
  return (
    <div
      className={className}
      data-craft-node-id={dataCraftNodeId}
    >
      {children}
    </div>
  )
}
