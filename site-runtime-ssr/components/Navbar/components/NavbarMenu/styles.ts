import {
  createElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react"

interface MenuShellProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  style?: CSSProperties;
}

export const MenuShell = ({
  children,
  className,
  style,
  ...rest
}: MenuShellProps) =>
  createElement("div", { className, style, ...rest }, children)
