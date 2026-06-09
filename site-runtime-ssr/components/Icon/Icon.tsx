import type { ReactNode } from "react"
import { BurgerIcon } from "./BurgerIcon"

export type IconVariant = "burger"

interface Props {
  icon?: IconVariant;
  className?: string;
  "data-craft-node-id"?: string;
  children?: ReactNode;
}

export const Icon = ({
  icon = "burger",
  className,
  "data-craft-node-id": dataCraftNodeId,
}: Props) => (
  <div className={className} data-craft-node-id={dataCraftNodeId}>
    {icon === "burger" && <BurgerIcon />}
  </div>
)
