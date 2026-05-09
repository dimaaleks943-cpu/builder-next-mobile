import {
  Box,
  Divider,
  IconButton,
  Paper,
  Popper,
  Typography,
} from "@mui/material"
import debounce from "lodash/debounce"
import type { ChangeEvent, Ref } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { COLORS } from "../../../../../theme/colors.ts"
import { CloseIcon } from "../../../../../icons/CloseIcon.tsx"
import { CraftSettingsSelect } from "../../../components/craftSettingsControls/CraftSettingsSelect.tsx"
import { CraftSettingsInput } from "../../../components/craftSettingsControls/CraftSettingsInput.tsx"
import { CraftSettingsColorField } from "../../../components/craftSettingsControls/CraftSettingsColorField.tsx"
import type {
  TextDecorationAdvancedParts,
  TextDecorationLinePreset,
} from "../textDecorationAdvanced.ts"

const COLOR_COMMIT_DEBOUNCE_MS = 120

const LINE_OPTIONS: {
  id: TextDecorationLinePreset;
  value: string;
}[] = [
  { id: "none", value: "None" },
  { id: "strikethrough", value: "Strikethrough" },
  { id: "underline", value: "Underline" },
  { id: "overline", value: "Overline" },
  { id: "underline_overline", value: "Underline + Overline" },
  {
    id: "underline_strikethrough",
    value: "Underline + Strikethrough",
  },
  {
    id: "overline_strikethrough",
    value: "Overline + Strikethrough",
  },
  { id: "all", value: "All" },
]

const STYLE_OPTIONS = [
  { id: "solid", value: "Solid" },
  { id: "double", value: "Double" },
  { id: "dotted", value: "Dotted" },
  { id: "dashed", value: "Dashed" },
  { id: "wavy", value: "Wavy" },
] as const

const SKIP_INK_OPTIONS = [
  { id: "auto", value: "auto" },
  { id: "none", value: "none" },
] as const

interface Props {
  open: boolean;
  anchorEl: HTMLElement | null;
  popperRef: Ref<HTMLDivElement>;
  parts: TextDecorationAdvancedParts;
  textDecorationSkipInk: string | undefined;
  onClose: () => void;
  onApplyPartsPatch: (patch: Partial<TextDecorationAdvancedParts>) => void;
  onApplySkipInk: (next: string | undefined) => void;
}

export const TypographyDecorationSettingsPopper = ({
  open,
  anchorEl,
  popperRef,
  parts,
  textDecorationSkipInk,
  onClose,
  onApplyPartsPatch,
  onApplySkipInk,
}: Props) => {
  const [colorDraft, setColorDraft] = useState(parts.color)
  const onApplyPartsPatchRef = useRef(onApplyPartsPatch)
  onApplyPartsPatchRef.current = onApplyPartsPatch

  const debouncedCommitColor = useMemo(
    () =>
      debounce((color: string) => {
        onApplyPartsPatchRef.current({ color })
      }, COLOR_COMMIT_DEBOUNCE_MS),
    [],
  )

  useEffect(() => () => debouncedCommitColor.cancel(), [debouncedCommitColor])

  useEffect(() => {
    if (!open) {
      debouncedCommitColor.flush()
    }
  }, [open, debouncedCommitColor])

  useEffect(() => {
    setColorDraft(parts.color)
  }, [parts.color])

  const handleColorChange = (value: string) => {
    setColorDraft(value)
    debouncedCommitColor(value)
  }

  const skipInkUi = textDecorationSkipInk ?? "auto"

  const handleLineChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onApplyPartsPatch({
      line: event.target.value as TextDecorationLinePreset,
    })
  }

  const handleStyleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const id = event.target.value as (typeof STYLE_OPTIONS)[number]["id"]
    onApplyPartsPatch({
      style: id === "solid" ? undefined : id,
    })
  }

  const handleThicknessChange = (event: ChangeEvent<HTMLInputElement>) => {
    const v = event.target.value
    if (v === "") {
      onApplyPartsPatch({ thicknessPx: "" })
      return
    }
    const n = Number(v)
    if (!Number.isFinite(n) || n < 0) return
    onApplyPartsPatch({ thicknessPx: String(n) })
  }

  const handleSkipInkChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const v = event.target.value
    if (v === "auto") {
      onApplySkipInk(undefined)
      return
    }
    onApplySkipInk(v)
  }

  const styleSelectValue = parts.style ?? "solid"

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      modifiers={[{ name: "offset", options: { offset: [0, 6] } }]}
      style={{ zIndex: 4000 }}
    >
      <Paper
        ref={popperRef}
        elevation={3}
        sx={{
          width: "288px",
          maxWidth: "min(288px, calc(100vw - 24px))",
          border: `1px solid ${COLORS.purple100}`,
          borderRadius: "8px",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          boxSizing: "border-box",
          overflow: "visible",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <Typography
            sx={{
              fontSize: "12px",
              lineHeight: "16px",
              fontWeight: 600,
              color: COLORS.black,
            }}
          >
            Настройки подчеркивания
          </Typography>
          <IconButton
            disableRipple
            size="small"
            aria-label="Close"
            onClick={onClose}
            sx={{
              padding: "4px",
              color: COLORS.gray700,
              "&:hover": {
                backgroundColor: COLORS.secondaryVeryLightGray,
              },
            }}
          >
            <CloseIcon size={12} fill={COLORS.gray700}/>
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: COLORS.purple100 }}/>

        <CraftSettingsSelect
          label="Line"
          value={parts.line}
          onChange={handleLineChange}
          disableResetPopperPortal
          options={LINE_OPTIONS.map((o) => ({
            id: o.id,
            value: o.value,
          }))}
          labelReset={{
            hasValue: parts.line !== "none",
            onReset: () => {
              onApplyPartsPatch({ line: "none" })
            },
          }}
        />

        <CraftSettingsSelect
          label="Style"
          value={styleSelectValue}
          onChange={handleStyleChange}
          disableResetPopperPortal
          options={STYLE_OPTIONS.map((o) => ({
            id: o.id,
            value: o.value,
          }))}
          disabled={parts.line === "none"}
          labelReset={{
            hasValue: parts.style !== undefined,
            onReset: () => {
              onApplyPartsPatch({ style: undefined })
            },
          }}
        />

        <CraftSettingsInput
          label="Thick"
          type="number"
          min={0}
          value={parts.thicknessPx === "" ? "" : parts.thicknessPx}
          onChange={handleThicknessChange}
          suffix="px"
          disableResetPopperPortal
          disabled={parts.line === "none"}
          labelReset={{
            hasValue: parts.thicknessPx.trim() !== "",
            onReset: () => {
              onApplyPartsPatch({ thicknessPx: "" })
            },
          }}
        />

        <CraftSettingsColorField
          label="Color"
          value={colorDraft}
          onChange={handleColorChange}
          disableResetPopperPortal
          disabled={parts.line === "none"}
          labelReset={{
            hasValue: parts.color.trim() !== "",
            onReset: () => {
              debouncedCommitColor.cancel()
              setColorDraft("")
              onApplyPartsPatch({ color: "" })
            },
          }}
        />

        <CraftSettingsSelect
          label="Skip ink"
          value={skipInkUi}
          onChange={handleSkipInkChange}
          disableResetPopperPortal
          options={SKIP_INK_OPTIONS.map((o) => ({
            id: o.id,
            value: o.value,
          }))}
          labelReset={{
            hasValue: textDecorationSkipInk !== undefined,
            onReset: () => {
              onApplySkipInk(undefined)
            },
          }}
        />
      </Paper>
    </Popper>
  )
}
