import { useEffect, useState } from "react"
import type { ChangeEvent, KeyboardEvent } from "react"
import { useEditor } from "@craftjs/core"
import {
  normalizeHtmlIdProp,
  stripSpacesFromHtmlIdInput,
} from "../../../../craft/htmlIdUtils.ts"
import { CraftSettingsInput } from "../../components/craftSettingsControls/CraftSettingsInput.tsx"
import { Box } from "@mui/material";
import { COLORS } from "../../../../theme/colors.ts";

interface HtmlIdCraftProps {
  htmlId?: string
}

interface Props {
  nodeId?: string
}

export const HtmlIdSettingsFields = ({ nodeId }: Props) => {
  const { actions } = useEditor()
  const { targetId, htmlId } = useEditor((state) => {
    const id =
      nodeId ??
      (Array.from(state.events.selected)[0] as string | undefined) ??
      null
    const node = id ? state.nodes[id] : null
    const raw = node?.data.props as HtmlIdCraftProps | undefined

    return {
      targetId: id,
      htmlId: raw?.htmlId ?? "",
    }
  })

  const [draft, setDraft] = useState(htmlId)

  useEffect(() => {
    setDraft(htmlId)
  }, [htmlId, targetId])

  if (!targetId) {
    return null
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = stripSpacesFromHtmlIdInput(event.target.value)
    setDraft(value)
    actions.setProp(targetId, (props: HtmlIdCraftProps) => {
      props.htmlId = normalizeHtmlIdProp(value)
    })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault()
    }
  }

  return (
    <Box sx={{ padding: "8px 16px", backgroundColor: COLORS.white }}>
      <CraftSettingsInput
        label="ID"
        value={draft}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </Box>
  )
}
