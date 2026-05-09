import { Box } from "@mui/material"
import type { ChangeEvent } from "react"
import { CraftSettingsSelect } from "../../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { CraftSettingsButtonGroup } from "../../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import {
  getResponsiveStyleProp,
  setResponsiveStyleProp,
} from "../../../responsiveStyle.ts"
import type { PreviewViewport } from "../../../builder.enum.ts"

const OVERFLOW_WRAP_OPTIONS = [
  { id: "normal", value: "Normal" },
  { id: "anywhere", value: "Anywhere" },
  { id: "break-word", value: "Break word" },
] as const

const OVERFLOW_WRAP_IDS = new Set<string>(
  OVERFLOW_WRAP_OPTIONS.map((option) => option.id),
)

const TRUNCATE_IDS = new Set(["clip", "ellipsis"])

interface Props {
  actions: {
    setProp: (
      id: string,
      updater: (props: Record<string, unknown>) => void,
    ) => void
  };
  selectedId: string;
  selectedProps: Record<string, unknown>;
  viewport: PreviewViewport;
}

export const TypographyWrapTruncateSection = ({
  actions,
  selectedId,
  selectedProps,
  viewport,
}: Props) => {
  const overflowWrapRaw = getResponsiveStyleProp(
    selectedProps,
    "overflowWrap",
    viewport,
  )
  const overflowWrapStr =
    overflowWrapRaw !== undefined && overflowWrapRaw !== null
      ? String(overflowWrapRaw).trim()
      : ""
  const overflowWrapSelectValue = OVERFLOW_WRAP_IDS.has(overflowWrapStr)
    ? overflowWrapStr
    : "normal"
  const hasOverflowWrapExplicit = overflowWrapStr !== ""

  const handleOverflowWrapChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      if (next === "normal") {
        setResponsiveStyleProp(props, "overflowWrap", undefined, viewport)
        return
      }
      setResponsiveStyleProp(props, "overflowWrap", next, viewport)
    })
  }

  const resetOverflowWrap = () => {
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "overflowWrap", undefined, viewport)
    })
  }

  const textOverflowRaw = getResponsiveStyleProp(
    selectedProps,
    "textOverflow",
    viewport,
  )
  const textOverflowStr =
    textOverflowRaw !== undefined && textOverflowRaw !== null
      ? String(textOverflowRaw).trim()
      : ""
  /** No craft value → neither button selected; only reset clears the property. */
  const truncateValue = TRUNCATE_IDS.has(textOverflowStr)
    ? textOverflowStr
    : undefined
  const hasTextOverflowExplicit = textOverflowStr !== ""

  const handleTruncateChange = (id: string) => {
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "textOverflow", id, viewport)
    })
  }

  const resetTruncate = () => {
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      setResponsiveStyleProp(props, "textOverflow", undefined, viewport)
    })
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "100%",
      }}
    >
      <CraftSettingsSelect
        label="Wrap"
        labelReset={{
          hasValue: hasOverflowWrapExplicit,
          onReset: resetOverflowWrap,
        }}
        value={overflowWrapSelectValue}
        onChange={handleOverflowWrapChange}
        options={[...OVERFLOW_WRAP_OPTIONS]}
      />

      <CraftSettingsButtonGroup
        label="Truncate"
        value={truncateValue}
        resetLabelActive={hasTextOverflowExplicit}
        options={[
          { id: "clip", content: "Clip" },
          { id: "ellipsis", content: "Ellipsis" },
        ]}
        onChange={handleTruncateChange}
        onReset={resetTruncate}
      />
    </Box>
  )
}
