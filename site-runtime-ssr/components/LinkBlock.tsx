import type { ReactNode } from "react"
import { useResolvedLinkHref } from "@/hooks/useResolvedLinkHref"

interface LinkBlockProps {
  children?: ReactNode
  className?: string
  "data-craft-node-id"?: string
  href?: string
  linkMode?: "url" | "page" | "collectionItemPage"
  collectionItemLinkTarget?: "none" | "template"
  collectionItemTemplatePageId?: string | null
  openInNewTab?: boolean
}

export const LinkBlock = ({
  children,
  className,
  "data-craft-node-id": dataCraftNodeId,
  href = "http://www.google.com",
  linkMode = "url",
  collectionItemLinkTarget = "none",
  collectionItemTemplatePageId = null,
  openInNewTab = false,
}: LinkBlockProps) => {
  const resolvedHref = useResolvedLinkHref({
    href,
    linkMode,
    collectionItemLinkTarget,
    collectionItemTemplatePageId,
    logTag: "LinkBlock",
  })

  return (
    <a
      className={className}
      data-craft-node-id={dataCraftNodeId}
      href={resolvedHref}
      target={openInNewTab ? "_blank" : "_self"}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      {children}
    </a>
  )
}
