import type { ChangeEvent } from "react"
import { Box } from "@mui/material"
import { useEditor } from "@craftjs/core"
import { usePreviewViewport } from "../context/PreviewViewportContext.tsx"
import { setResponsiveStyleProp } from "../responsiveStyle.ts"

export type Edge = "Top" | "Right" | "Bottom" | "Left"

type EdgeInputProps = {
  nodeId: string
  kind: "margin" | "padding"
  side: Edge
  value: number
  onChangeProp?: (side: Edge, value: number) => void
  sx?: any
}

export const EdgeInput = ({ nodeId, kind, side, value, onChangeProp, sx }: EdgeInputProps) => {
  const { actions } = useEditor()
  const viewport = usePreviewViewport()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    const safe = Number.isNaN(next) ? 0 : next

    if (onChangeProp) {
      onChangeProp(side, safe)
    }

    actions.setProp(nodeId, (props: any) => {
      const key = `${kind}${side}` as
        | "marginTop" | "marginRight" | "marginBottom" | "marginLeft"
        | "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft"
      setResponsiveStyleProp(props, key, safe, viewport)
    })
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

