import { Box, Typography } from "@mui/material"
import type { ChangeEvent } from "react"
import { COLORS } from "../../../../../theme/colors.ts"
import { CraftSettingsSelect } from "../../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { useStyleEditing } from "../../../hooks/useStyleEditing.ts"
import { BottomResetLabel } from "./BottomResetLabel.tsx"

const WORD_BREAK_SELECT_OPTIONS = [
  { id: "normal", value: "Normal" },
  { id: "break-all", value: "Break all" },
  { id: "keep-all", value: "Keep all" },
]

const WHITE_SPACE_SELECT_OPTIONS = [
  { id: "normal", value: "Normal" },
  { id: "nowrap", value: "No wrap" },
  { id: "pre", value: "Pre" },
  { id: "pre-wrap", value: "Pre wrap" },
  { id: "pre-line", value: "Pre line" },
  { id: "break-spaces", value: "Break spaces" },
]

const WORD_BREAK_IDS = new Set(WORD_BREAK_SELECT_OPTIONS.map((o) => o.id))
const WHITE_SPACE_IDS = new Set(WHITE_SPACE_SELECT_OPTIONS.map((o) => o.id))

export const TypographyBreakingRow = () => {
  const { getStyleProp, setStyleProp } = useStyleEditing()
  const wordBreakProp = getStyleProp("wordBreak")
  const whiteSpaceProp = getStyleProp("whiteSpace")

  const wordBreakStr =
    wordBreakProp !== undefined && wordBreakProp !== null
      ? String(wordBreakProp).trim()
      : ""
  const whiteSpaceStr =
    whiteSpaceProp !== undefined && whiteSpaceProp !== null
      ? String(whiteSpaceProp).trim()
      : ""

  const wordBreakSelectValue = WORD_BREAK_IDS.has(wordBreakStr)
    ? wordBreakStr
    : "normal"
  const whiteSpaceSelectValue = WHITE_SPACE_IDS.has(whiteSpaceStr)
    ? whiteSpaceStr
    : "normal"

  const hasWordBreakValue =
    wordBreakStr !== "" && wordBreakStr !== "normal"
  const hasWhiteSpaceValue =
    whiteSpaceStr !== "" && whiteSpaceStr !== "normal"

  const handleWordBreakChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const v = event.target.value
    setStyleProp("wordBreak", v === "normal" ? undefined : v)
  }

  const resetWordBreak = () => {
    setStyleProp("wordBreak", undefined)
  }

  const handleWhiteSpaceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const v = event.target.value
    setStyleProp("whiteSpace", v === "normal" ? undefined : v)
  }

  const resetWhiteSpace = () => {
    setStyleProp("whiteSpace", undefined)
  }

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: "8px", width: "100%" }}>
      <Typography
        sx={{
          width: "48px",
          minWidth: "48px",
          flexShrink: 0,
          fontSize: "10px",
          lineHeight: "14px",
          color: COLORS.gray700,
          paddingTop: "6px",
        }}
      >
        Breaking
      </Typography>
      <Box sx={{ flex: 1, display: "flex", columnGap: "8px", minWidth: 0 }}>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            rowGap: "2px",
          }}
        >
          <CraftSettingsSelect
            label="Word break"
            showInlineLabel={false}
            value={wordBreakSelectValue}
            onChange={handleWordBreakChange}
            options={WORD_BREAK_SELECT_OPTIONS}
          />
          <BottomResetLabel
            hasValue={hasWordBreakValue}
            onReset={resetWordBreak}
          >
            Word
          </BottomResetLabel>
        </Box>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            rowGap: "2px",
          }}
        >
          <CraftSettingsSelect
            label="Line break / white-space"
            showInlineLabel={false}
            value={whiteSpaceSelectValue}
            onChange={handleWhiteSpaceChange}
            options={WHITE_SPACE_SELECT_OPTIONS}
          />
          <BottomResetLabel
            hasValue={hasWhiteSpaceValue}
            onReset={resetWhiteSpace}
          >
            Line
          </BottomResetLabel>
        </Box>
      </Box>
    </Box>
  )
}
