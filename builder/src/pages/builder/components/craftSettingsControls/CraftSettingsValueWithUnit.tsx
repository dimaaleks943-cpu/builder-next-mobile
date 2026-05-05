import { useEffect, useMemo, useRef, useState } from "react"
import type { ChangeEvent, KeyboardEvent } from "react"
import {
  Box,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
} from "@mui/material"
import { COLORS } from "../../../../theme/colors.ts"
import {
  CRAFT_SIZE_MENU_UNITS_WEB,
  type CraftSizeMenuToken,
  type CraftSizeMenuSelection,
  type FormatSizePropMode,
  formatSizeProp,
  parseInputWithUnit,
  parseSizeProp,
  unitTokenLabel,
} from "../../../../utils/craftCssSizeProp.ts"

const orderedAllowedTokens = (
  allowed: readonly CraftSizeMenuToken[],
): CraftSizeMenuToken[] => {
  return CRAFT_SIZE_MENU_UNITS_WEB.filter((u) =>
    (allowed as readonly string[]).includes(u),
  )
}

const defaultMenuSelection = (
  allowed: readonly CraftSizeMenuToken[],
): CraftSizeMenuSelection => {
  const ordered = orderedAllowedTokens(allowed)
  const first = ordered.find((u) => u !== "auto")
  return first ?? "px"
}

const viewStateFromProp = (
  value: unknown,
  allowed: readonly CraftSizeMenuToken[],
): { inputText: string; menuSelection: CraftSizeMenuSelection } => {
  const parsed = parseSizeProp(value)
  const allowedSet = new Set<string>(allowed)

  if (parsed.kind === "auto") {
    if (allowedSet.has("auto")) {
      return { inputText: "", menuSelection: "auto" }
    }
    return { inputText: "auto", menuSelection: "custom" }
  }

  if (parsed.kind === "length") {
    if (allowedSet.has(parsed.unit)) {
      return { inputText: parsed.n, menuSelection: parsed.unit }
    }
    const s = formatSizeProp(parsed, "web")
    const text = typeof s === "string" ? s : `${s}px`
    return { inputText: text, menuSelection: "custom" }
  }

  if (parsed.kind === "raw") {
    return { inputText: parsed.text, menuSelection: "custom" }
  }

  return {
    inputText: "",
    menuSelection: defaultMenuSelection(allowed),
  }
}

interface Props {
  label: string;
  value: unknown;
  onCommit: (next: string | number | undefined) => void;
  allowedUnits?: readonly CraftSizeMenuToken[];
  disabled?: boolean;
  placeholder?: string;
  mode?: FormatSizePropMode;
  inputWidth?: string;
  withoutLabel?: boolean;
  disableUnitPopperPortal?: boolean;
}

export const CraftSettingsValueWithUnit = ({
  label,
  value,
  onCommit,
  allowedUnits,
  disabled = false,
  placeholder = "Auto",
  mode = "web",
  inputWidth,
  withoutLabel = false,
  disableUnitPopperPortal = false,
}: Props) => {
  const resolvedAllowed = allowedUnits ?? CRAFT_SIZE_MENU_UNITS_WEB
  const unitOptions = useMemo(
    () => orderedAllowedTokens(resolvedAllowed),
    [resolvedAllowed],
  )

  const [inputText, setInputText] = useState("")
  const [menuSelection, setMenuSelection] =
    useState<CraftSizeMenuSelection>("px")
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const menuPaperRef = useRef<HTMLDivElement | null>(null)

  const blurCommitTimer = useRef<number | null>(null)

  useEffect(() => {
    const next = viewStateFromProp(value, resolvedAllowed)
    setInputText(next.inputText)
    setMenuSelection(next.menuSelection)
  }, [value, resolvedAllowed])

  useEffect(() => {
    if (!anchorEl) return
    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (anchorEl.contains(t)) return
      if (menuPaperRef.current?.contains(t)) return
      setAnchorEl(null)
    }
    document.addEventListener("mousedown", onDocMouseDown, true)
    return () => document.removeEventListener("mousedown", onDocMouseDown, true)
  }, [anchorEl])

  const cancelBlurCommit = () => {
    if (blurCommitTimer.current != null) {
      window.clearTimeout(blurCommitTimer.current)
      blurCommitTimer.current = null
    }
  }

  const commitParsed = (parsed: ReturnType<typeof parseInputWithUnit>) => {
    const next = formatSizeProp(parsed, mode)
    onCommit(next)
  }

  const commitFromInput = () => {
    const parsed = parseInputWithUnit(inputText, menuSelection)
    commitParsed(parsed)
  }

  const queueBlurCommit = () => {
    cancelBlurCommit()
    blurCommitTimer.current = window.setTimeout(() => {
      blurCommitTimer.current = null
      commitFromInput()
    }, 0)
  }

  useEffect(() => () => cancelBlurCommit(), [])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (menuSelection === "auto") return
    setInputText(event.target.value)
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation()
      setAnchorEl(null)
      const v = viewStateFromProp(value, resolvedAllowed)
      setInputText(v.inputText)
      setMenuSelection(v.menuSelection)
      return
    }
    if (event.key === "Enter") {
      event.preventDefault()
      cancelBlurCommit()
      commitFromInput()
    }
  }

  const handlePickUnit = (token: CraftSizeMenuToken) => {
    cancelBlurCommit()
    setAnchorEl(null)
    if (token === "auto") {
      setMenuSelection("auto")
      setInputText("")
      onCommit("auto")
      return
    }
    const parsed = parseInputWithUnit(inputText, token)
    setMenuSelection(token)
    commitParsed(parsed)
  }

  const chipLabel =
    menuSelection === "custom"
      ? "CUSTOM"
      : unitTokenLabel(menuSelection as CraftSizeMenuToken)

  const isAuto = menuSelection === "auto"
  const displayValue = isAuto ? "auto" : inputText

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        columnGap: "8px",
      }}
    >
      <Typography
        sx={{
          fontSize: "10px",
          lineHeight: "14px",
          color: COLORS.gray700,
          flex: 1,
          display: withoutLabel ? "none" : "block",
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          width: inputWidth ?? (withoutLabel ? "100%" : undefined),
          maxWidth: inputWidth ?? (withoutLabel ? "100%" : undefined),
          display: "flex",
          justifyContent: "space-between",
          flex: withoutLabel ? 1 : 4,
          minWidth: 0,
          alignItems: "center",
          boxSizing: "border-box",
          borderRadius: "4px",
          border: `1px solid ${COLORS.purple100}`,
          backgroundColor: COLORS.white,
          paddingLeft: "4px",
          paddingRight: "4px",
          "&:focus-within": {
            borderColor: COLORS.purple400,
          },
        }}
      >
        <Box
          component="input"
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={queueBlurCommit}
          onKeyDown={handleInputKeyDown}
          disabled={disabled}
          readOnly={isAuto}
          placeholder={isAuto ? "" : placeholder}
          inputMode={isAuto ? undefined : "decimal"}
          autoComplete="off"
          aria-label={label}
          sx={{
            border: "none",
            outline: "none",
            backgroundColor: "transparent",
            padding: "6px 0",
            fontSize: "12px",
            lineHeight: "14px",
            color: "inherit",
            width: "42px",
          }}
        />
        <Box
          component="button"
          type="button"
          disabled={disabled}
          onMouseDown={(e) => {
            e.preventDefault()
            cancelBlurCommit()
          }}
          onClick={(e) => {
            const el = e.currentTarget
            setAnchorEl((prev) => (prev === el ? null : el))
          }}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            margin: 0,
            padding: 0,
            fontFamily: "inherit",
            fontSize: "10px",
            lineHeight: "14px",
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: COLORS.gray700,
            backgroundColor: "transparent",
            cursor: disabled ? "default" : "pointer",
            "&:hover": disabled
              ? undefined
              : { color: COLORS.purple400 },
            "&:disabled": { opacity: 0.5 },
          }}
        >
          {chipLabel}
        </Box>
      </Box>

      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        placement="bottom-end"
        modifiers={[{ name: "offset", options: { offset: [0, 4] } }]}
        disablePortal={disableUnitPopperPortal}
        style={{ zIndex: 4000 }}
      >
        <Paper ref={menuPaperRef} elevation={3} sx={{ minWidth: 72 }}>
          <MenuList dense>
            {unitOptions.map((token) => (
              <MenuItem
                key={token}
                selected={
                  menuSelection !== "custom" && menuSelection === token
                }
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handlePickUnit(token)}
                sx={{ fontSize: "12px", lineHeight: "14px",}}
              >
                {unitTokenLabel(token)}
              </MenuItem>
            ))}
          </MenuList>
        </Paper>
      </Popper>
    </Box>
  )
}
