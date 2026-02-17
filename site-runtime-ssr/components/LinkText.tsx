interface LinkTextProps {
  text?: string
  href?: string
  openInNewTab?: boolean
  fontSize?: number
  fontWeight?: "normal" | "bold"
  textAlign?: "left" | "center" | "right"
  color?: string
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
}

export const LinkText = ({
  text = "Link",
  href = "#",
  openInNewTab = false,
  fontSize = 14,
  fontWeight = "normal",
  textAlign = "left",
  color = "#2967FF",
  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  marginLeft = 0,
}: LinkTextProps) => {
  return (
    <a
      href={href}
      target={openInNewTab ? "_blank" : "_self"}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      style={{
        display: "inline-block",
        fontSize,
        fontWeight,
        textAlign,
        color,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        textDecoration: "underline",
      }}
    >
      {text}
    </a>
  )
}
