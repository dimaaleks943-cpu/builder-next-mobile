import type { ChangeEvent } from "react"
import { Box } from "@mui/material"
import { useEditor } from "@craftjs/core"
import { SettingsAccordion } from "./components/SettingsAccordion/SettingsAccordion.tsx"
import { CraftSettingsButtonGroup } from "../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { CraftSettingsInput } from "../components/craftSettingsControls/CraftSettingsInput.tsx"
import { CraftSettingsSelect } from "../components/craftSettingsControls/CraftSettingsSelect.tsx"
import type {
  NavbarEasingValue,
  NavbarMenuPreviewValue,
  NavbarMenuTypeValue,
} from "../context/navbarMenuContext.tsx"

interface SelectedNavbarProps {
  menuPreview?: NavbarMenuPreviewValue
  menuType?: NavbarMenuTypeValue
  easingOpen?: NavbarEasingValue
  easingClose?: NavbarEasingValue
  durationMs?: number
}

interface EditorSelection {
  nodeProps: SelectedNavbarProps | null
}

interface Props {
  nodeId: string
  /** Если true — рендерится как аккордеон в правой панели, иначе — как простой блок в модалке. */
  asAccordion?: boolean
}

const EASING_OPTIONS = [
  { id: "ease", value: "Ease" },
  { id: "linear", value: "Linear" },
  { id: "ease-in", value: "Ease-in" },
  { id: "ease-out", value: "Ease-out" },
  { id: "ease-in-out", value: "Ease-in-out" },
]

const MENU_TYPE_OPTIONS = [
  { id: "dropDown", value: "Drop Down" },
  { id: "overRight", value: "Over Right" },
  { id: "overLeft", value: "Over Left" },
]

export const NavbarSettingsFields = ({ nodeId, asAccordion }: Props) => {
  const { actions } = useEditor()
  const { nodeProps } = useEditor((state): EditorSelection => {
    const node = state.nodes[nodeId]
    return {
      nodeProps: (node?.data.props as SelectedNavbarProps | undefined) ?? null,
    }
  })

  if (!nodeProps) {
    return null
  }

  const menuPreview = nodeProps.menuPreview ?? "hide"
  const menuType = nodeProps.menuType ?? "dropDown"
  const easingOpen = nodeProps.easingOpen ?? "ease"
  const easingClose = nodeProps.easingClose ?? "ease"
  const durationMs = nodeProps.durationMs ?? 400

  const handleMenuPreviewChange = (value: string) => {
    actions.setProp(nodeId, (props: SelectedNavbarProps) => {
      props.menuPreview = value as NavbarMenuPreviewValue
    })
  }

  const handleMenuTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    actions.setProp(nodeId, (props: SelectedNavbarProps) => {
      props.menuType = event.target.value as NavbarMenuTypeValue
    })
  }

  const handleEasingOpenChange = (event: ChangeEvent<HTMLSelectElement>) => {
    actions.setProp(nodeId, (props: SelectedNavbarProps) => {
      props.easingOpen = event.target.value as NavbarEasingValue
    })
  }

  const handleEasingCloseChange = (event: ChangeEvent<HTMLSelectElement>) => {
    actions.setProp(nodeId, (props: SelectedNavbarProps) => {
      props.easingClose = event.target.value as NavbarEasingValue
    })
  }

  const handleDurationChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/\D/g, "")
    const parsed = raw === "" ? 0 : parseInt(raw, 10)
    actions.setProp(nodeId, (props: SelectedNavbarProps) => {
      props.durationMs = Number.isNaN(parsed) ? 0 : parsed
    })
  }

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <CraftSettingsButtonGroup
        label="Menu"
        value={menuPreview}
        options={[
          { id: "show", content: "Show" },
          { id: "hide", content: "Hide" },
        ]}
        onChange={handleMenuPreviewChange}
      />

      <CraftSettingsSelect
        label="Type"
        value={menuType}
        onChange={handleMenuTypeChange}
        options={MENU_TYPE_OPTIONS}
      />

      <CraftSettingsSelect
        label="Easing open"
        value={easingOpen}
        onChange={handleEasingOpenChange}
        options={EASING_OPTIONS}
      />

      <CraftSettingsSelect
        label="Easing close"
        value={easingClose}
        onChange={handleEasingCloseChange}
        options={EASING_OPTIONS}
      />

      <CraftSettingsInput
        label="Duration"
        type="number"
        suffix="MS"
        value={durationMs}
        onChange={handleDurationChange}
        min={0}
      />
    </Box>
  )

  return (
    <SettingsAccordion asAccordion={asAccordion} title="Navbar settings">
      {content}
    </SettingsAccordion>
  )
}
