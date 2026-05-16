import type { ChangeEvent } from "react"
import { Box } from "@mui/material"
import { useStyleEditing } from "../hooks/useStyleEditing.ts"

export type Edge = "Top" | "Right" | "Bottom" | "Left"

interface Props {
  kind: "margin" | "padding"
  side: Edge
  value: number
  onChangeProp?: (side: Edge, value: number) => void
  sx?: any
}

export const EdgeInput = ({ kind, side, value, onChangeProp, sx }: Props) => {
  const { setStyleProp } = useStyleEditing()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? 0 : next

    if (onChangeProp) {
      onChangeProp(side, safe)
    }

    const key = `${kind}${side}` as
      | "marginTop"
      | "marginRight"
      | "marginBottom"
      | "marginLeft"
      | "paddingTop"
      | "paddingRight"
      | "paddingBottom"
      | "paddingLeft"
    setStyleProp(key, safe)
  }

  return (
    <Box
      component="input"
      type="number"
      value={value}
      onChange={handleChange}
      sx={{
        border: "none",
        outline: "none",
        backgroundColor: "transparent",
        textAlign: "center",
        fontSize: 12,
        width: "100%",
        MozAppearance: "textfield",
        "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
          WebkitAppearance: "none",
          margin: 0,
        },
        ...sx,
      }}
    />
  )
}
