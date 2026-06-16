import type { ReactNode } from "react"
import { BurgerIcon } from "./BurgerIcon"

export type IconVariant = "burger"

interface Props {
  icon?: IconVariant;
  className?: string;
  "data-craft-node-id"?: string;
  htmlId?: string;
  children?: ReactNode;
}

export const Icon = ({
  icon = "burger",
  className,
  "data-craft-node-id": dataCraftNodeId,
  htmlId,
}: Props) => (
  <div
    className={className}
    data-craft-node-id={dataCraftNodeId}
    {...(htmlId ? { id: htmlId } : {})}
  >
    {icon === "burger" && <BurgerIcon />}
  </div>
)
