import type { ReactNode } from "react"
import { useResolvedLinkHref } from "@/hooks/useResolvedLinkHref"

interface LinkBlockProps {
  children?: ReactNode
  className?: string
  "data-craft-node-id"?: string
  htmlId?: string
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
  htmlId,
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
      {...(htmlId ? { id: htmlId } : {})}
      href={resolvedHref}
      target={openInNewTab ? "_blank" : "_self"}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      {children}
    </a>
  )
}
