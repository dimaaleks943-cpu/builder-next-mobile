import type { ReactNode } from "react"

interface Props {
  children?: ReactNode;
  className?: string;
  "data-craft-node-id"?: string;
  htmlId?: string;
}

export const Block = ({
  children,
  className,
  "data-craft-node-id": dataCraftNodeId,
  htmlId,
  // Responsive visual styles come from className CSS rules generated from props.style.*.
  // Keep inline style empty to avoid overriding those rules with legacy flat props/defaults.
}: Props) => {
  return (
    <div
      className={className}
      data-craft-node-id={dataCraftNodeId}
      {...(htmlId ? { id: htmlId } : {})}
    >
      {children}
    </div>
  )
}
