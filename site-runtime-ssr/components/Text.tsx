interface TextProps {
  text?: string
  fontSize?: number
  fontWeight?: "normal" | "bold"
  textAlign?: "left" | "center" | "right"
  color?: string
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
}

export const Text = ({
  text = "Text",
  fontSize = 14,
  fontWeight = "normal",
  textAlign = "left",
  color = "#2D2D2F",
  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  marginLeft = 0,
  paddingTop = 0,
  paddingRight = 0,
  paddingBottom = 0,
  paddingLeft = 0,
}: TextProps) => {
  return (
    <span
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
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
      }}
    >
      {text}
    </span>
  )
}
