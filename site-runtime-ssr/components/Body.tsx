import type { ReactNode } from "react"
import { type CraftVisualEffectsProps } from "@/lib/craftVisualEffects"

interface BodyProps extends CraftVisualEffectsProps {
  children?: ReactNode
  className?: string
  "data-craft-node-id"?: string
}

export const Body = ({
  children,
  className,
  "data-craft-node-id": dataCraftNodeId,
  // Responsive visual styles come from className CSS rules generated from props.style.*.
}: BodyProps) => {
  return (
    <div
      className={className}
      data-craft-node-id={dataCraftNodeId}
    >
      {children}
    </div>
  )
}
