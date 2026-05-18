import type { ReactNode } from "react"

interface Props {
  children?: ReactNode
  className?: string
  "data-craft-node-id"?: string
}

export const Block = ({
  children,
  className,
  "data-craft-node-id": dataCraftNodeId,
  // Responsive visual styles come from className CSS rules generated from props.style.*.
  // Keep inline style empty to avoid overriding those rules with legacy flat props/defaults.
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
