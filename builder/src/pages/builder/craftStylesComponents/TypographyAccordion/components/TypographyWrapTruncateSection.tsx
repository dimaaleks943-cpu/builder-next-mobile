import { Box } from "@mui/material"
import type { ChangeEvent } from "react"
import { CraftSettingsSelect } from "../../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { CraftSettingsButtonGroup } from "../../../components/craftSettingsControls/CraftSettingsButtonGroup.tsx"
import { useStyleEditing } from "../../../hooks/useStyleEditing.ts"

const OVERFLOW_WRAP_OPTIONS = [
  { id: "normal", value: "Normal" },
  { id: "anywhere", value: "Anywhere" },
  { id: "break-word", value: "Break word" },
] as const

const OVERFLOW_WRAP_IDS = new Set<string>(
  OVERFLOW_WRAP_OPTIONS.map((option) => option.id),
)

const TRUNCATE_IDS = new Set(["clip", "ellipsis"])

export const TypographyWrapTruncateSection = () => {
  const { getStyleProp, setStyleProp } = useStyleEditing()
  const overflowWrapRaw = getStyleProp("overflowWrap")
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
    setStyleProp("overflowWrap", next === "normal" ? undefined : next)
  }

  const resetOverflowWrap = () => setStyleProp("overflowWrap", undefined)

  const textOverflowRaw = getStyleProp("textOverflow")
  const textOverflowStr =
    textOverflowRaw !== undefined && textOverflowRaw !== null
      ? String(textOverflowRaw).trim()
      : ""
  /** No craft value → neither button selected; only reset clears the property. */
  const truncateValue = TRUNCATE_IDS.has(textOverflowStr)
    ? textOverflowStr
    : undefined
  const hasTextOverflowExplicit = textOverflowStr !== ""

  const handleTruncateChange = (id: string) => setStyleProp("textOverflow", id)
  const resetTruncate = () => setStyleProp("textOverflow", undefined)

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
