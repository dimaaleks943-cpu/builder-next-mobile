import { useEffect, useMemo, useRef, useState } from "react"
import type { ChangeEvent, KeyboardEvent } from "react"
import {
  Box,
  MenuItem,
  MenuList,
  Paper,
  Popper,
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
import {
  degreesToUnitValue,
  formatAngleInputDisplay,
  formatGradientAngleCss,
  parseGradientAnglePrefix,
  unitValueToDegrees,
  wrapUnitValue,
  type GradientAngleUnit,
} from "../../craftStylesComponents/BackgroundAccordion/utils/linearGradientAngleUtils.ts"
import { CraftSettingsFluidLabel } from "./styles.ts"

const orderedAllowedTokens = (
  allowed: readonly CraftSizeMenuToken[],
): CraftSizeMenuToken[] => {
  const globalSet = new Set<string>(CRAFT_SIZE_MENU_UNITS_WEB)
  return allowed.filter((u) => globalSet.has(u))
}

const defaultMenuSelection = (
  allowed: readonly CraftSizeMenuToken[],
): CraftSizeMenuSelection => {
  const ordered = orderedAllowedTokens(allowed)
  const first = ordered.find((u) => u !== "auto")
  return first ?? "px"
}

const ANGLE_NUM_RE = /^-?(?:\d+\.?\d*|\.\d+)$/

const trimAngleNumericString = (s: string): string => {
  if (/^\./.test(s)) return `0${s}`
  if (/\.$/.test(s)) return s.slice(0, -1)
  return s
}

const orderedGradientAngleUnits = (
  allowed: readonly GradientAngleUnit[] | undefined,
): GradientAngleUnit[] => (allowed?.length ? [...allowed] : [])

const viewStateFromGradientAngleProp = (
  value: unknown,
  allowed: readonly GradientAngleUnit[],
): { inputText: string; menuSelection: GradientAngleUnit | "custom" } => {
  const allowedSet = new Set<GradientAngleUnit>(allowed)
  if (allowed.length === 0) {
    return { inputText: "", menuSelection: "deg" }
  }
  if (typeof value !== "string") {
    return { inputText: "", menuSelection: allowed[0]! }
  }
  const m = value.trim().match(/^(-?(?:\d+\.?\d*|\.\d+))(deg|grad|turn|rad)$/i)
  if (m) {
    const u = m[2]!.toLowerCase() as GradientAngleUnit
    if (allowedSet.has(u)) {
      return { inputText: trimAngleNumericString(m[1]!), menuSelection: u }
    }
  }
  return { inputText: value.trim(), menuSelection: "custom" }
}

const commitGradientAngleFromInput = (
  inputText: string,
  menuSelection: GradientAngleUnit | "custom",
): string | undefined => {
  if (menuSelection === "custom") return undefined
  const t = inputText.trim()
  if (t === "") return undefined
  if (!ANGLE_NUM_RE.test(t)) return undefined
  const n = Number(trimAngleNumericString(t))
  if (!Number.isFinite(n)) return undefined
  const wrapped = wrapUnitValue(n, menuSelection)
  return formatGradientAngleCss(wrapped, menuSelection)
}

const gradientAngleUnitMenuLabel = (u: GradientAngleUnit): string =>
  u === "deg" ? "DEG" : u === "rad" ? "RAD" : u === "turn" ? "TURN" : "GRAD"

const isGradientAngleUnitToken = (x: string): x is GradientAngleUnit =>
  x === "deg" || x === "grad" || x === "turn" || x === "rad"

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
  /** CSS gradient angle units (`75deg`…); меню и парсинг как у размеров, но с wrap по кругу. */
  gradientAngleUnits?: readonly GradientAngleUnit[];
  disabled?: boolean;
  placeholder?: string;
  mode?: FormatSizePropMode;
  inputWidth?: string;
  withoutLabel?: boolean;
  disableUnitPopperPortal?: boolean;
  unitless?: boolean;
  customWidth?: string;
  /** Default matches legacy uppercase chip labels; mutedLowercase matches typography mocks. */
  unitAffixVariant?: "chip" | "mutedLowercase";
}

export const CraftSettingsValueWithUnit = ({
  label,
  value,
  onCommit,
  allowedUnits,
  gradientAngleUnits,
  disabled = false,
  placeholder = "Auto",
  mode = "web",
  inputWidth,
  withoutLabel = false,
  disableUnitPopperPortal = false,
  unitless = false,
  customWidth = "42px",
  unitAffixVariant = "chip",
}: Props) => {
  const resolvedAngleUnits = useMemo(
    () => orderedGradientAngleUnits(gradientAngleUnits),
    [gradientAngleUnits],
  )
  const isGradientAngleMode = resolvedAngleUnits.length > 0

  const resolvedAllowed = allowedUnits ?? CRAFT_SIZE_MENU_UNITS_WEB
  const unitOptions = useMemo(() => {
    if (isGradientAngleMode) return resolvedAngleUnits
    return orderedAllowedTokens(resolvedAllowed)
  }, [isGradientAngleMode, resolvedAngleUnits, resolvedAllowed])

  const [inputText, setInputText] = useState("")
  const [menuSelection, setMenuSelection] =
    useState<CraftSizeMenuSelection | GradientAngleUnit>(() => gradientAngleUnits?.length ? gradientAngleUnits[0]! : "px",)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const menuPaperRef = useRef<HTMLDivElement | null>(null)

  const blurCommitTimer = useRef<number | null>(null)

  useEffect(() => {
    if (unitless) {
      if (value === undefined || value === null) {
        setInputText("")
        return
      }
      setInputText(typeof value === "number" ? String(value) : String(value))
      return
    }
    if (isGradientAngleMode) {
      const next = viewStateFromGradientAngleProp(value, resolvedAngleUnits)
      setInputText(next.inputText)
      setMenuSelection(next.menuSelection)
      return
    }
    const next = viewStateFromProp(value, resolvedAllowed)
    setInputText(next.inputText)
    setMenuSelection(next.menuSelection)
  }, [value, resolvedAllowed, unitless, isGradientAngleMode, resolvedAngleUnits])

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
    if (unitless) {
      const t = inputText.trim()
      if (t === "") {
        onCommit(undefined)
        return
      }
      if (/^auto$/i.test(t)) {
        onCommit("auto")
        return
      }
      if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(t)) {
        const n = Number(t)
        onCommit(Number.isFinite(n) ? n : undefined)
        return
      }
      onCommit(t)
      return
    }
    if (isGradientAngleMode) {
      const sel = menuSelection as GradientAngleUnit | "custom"
      const out = commitGradientAngleFromInput(inputText, sel)
      if (out !== undefined) onCommit(out)
      return
    }
    const parsed = parseInputWithUnit(
      inputText,
      menuSelection as CraftSizeMenuSelection,
    )
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
      if (isGradientAngleMode) {
        const v = viewStateFromGradientAngleProp(value, resolvedAngleUnits)
        setInputText(v.inputText)
        setMenuSelection(v.menuSelection)
        return
      }
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

  const handlePickUnit = (token: CraftSizeMenuToken | GradientAngleUnit) => {
    cancelBlurCommit()
    setAnchorEl(null)

    if (unitless) return

    if (isGradientAngleMode && isGradientAngleUnitToken(token)) {
      const nextUnit = token
      const prevUnitEffective = (): GradientAngleUnit => {
        if (menuSelection !== "custom" && isGradientAngleUnitToken(menuSelection)) {
          return menuSelection
        }
        const p = parseGradientAnglePrefix(typeof value === "string" ? value : null)
        return p.kind === "numeric" ? p.unit : nextUnit
      }
      const pu = prevUnitEffective()

      const t = inputText.trim()
      let angleDegCanonical: number
      if (!ANGLE_NUM_RE.test(t)) {
        const parsed = parseGradientAnglePrefix(typeof value === "string" ? value : null)
        angleDegCanonical = parsed.kind === "numeric" ? parsed.angleDeg : 0
      } else {
        const n = Number(trimAngleNumericString(t))
        const wrapped = wrapUnitValue(n, pu)
        angleDegCanonical = unitValueToDegrees(wrapped, pu)
      }

      const nextVal = degreesToUnitValue(angleDegCanonical, nextUnit)
      const nextWrapped = wrapUnitValue(nextVal, nextUnit)
      const nextText = formatAngleInputDisplay(nextWrapped, nextUnit)
      setMenuSelection(nextUnit)
      setInputText(nextText)
      onCommit(formatGradientAngleCss(nextWrapped, nextUnit))
      return
    }

    const sizeToken = token as CraftSizeMenuToken
    if (sizeToken === "auto") {
      setMenuSelection("auto")
      setInputText("")
      onCommit("auto")
      return
    }
    const parsed = parseInputWithUnit(inputText, sizeToken)
    setMenuSelection(sizeToken)
    commitParsed(parsed)
  }

  const chipLabel = isGradientAngleMode
    ? menuSelection === "custom"
      ? "CUSTOM"
      : gradientAngleUnitMenuLabel(menuSelection as GradientAngleUnit)
    : menuSelection === "custom"
      ? "CUSTOM"
      : unitTokenLabel(menuSelection as CraftSizeMenuToken)

  const mutedLowercaseAffix = isGradientAngleMode
    ? menuSelection === "custom"
      ? "custom"
      : String(menuSelection).toLowerCase()
    : menuSelection === "custom"
      ? "custom"
      : menuSelection === "auto"
        ? "auto"
        : String(menuSelection).toLowerCase()

  const isAuto = !isGradientAngleMode && menuSelection === "auto"
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
      <CraftSettingsFluidLabel
        sx={{
          color: COLORS.gray700,
          display: withoutLabel ? "none" : "block",
        }}
      >
        {label}
      </CraftSettingsFluidLabel>
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
            width: customWidth,
          }}
        />
        {!unitless ? (
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
              fontWeight: 400,
              letterSpacing:
                unitAffixVariant === "mutedLowercase" ? "normal" : "0.04em",
              color:
                unitAffixVariant === "mutedLowercase"
                  ? COLORS.gray500
                  : COLORS.gray700,
              backgroundColor: "transparent",
              cursor: disabled ? "default" : "pointer",
              textTransform:
                unitAffixVariant === "mutedLowercase" ? "none" : undefined,
              "&:hover": disabled ? undefined : { color: COLORS.purple400 },
              "&:disabled": { opacity: 0.5 },
            }}
          >
            {unitAffixVariant === "mutedLowercase"
              ? mutedLowercaseAffix
              : chipLabel}
          </Box>
        ) : null}
      </Box>

      {!unitless ? (
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
                  key={String(token)}
                  selected={menuSelection !== "custom" && menuSelection === token}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handlePickUnit(token as CraftSizeMenuToken | GradientAngleUnit)}
                  sx={{ fontSize: "12px", lineHeight: "14px" }}
                >
                  {isGradientAngleMode
                    ? gradientAngleUnitMenuLabel(token as GradientAngleUnit)
                    : unitTokenLabel(token as CraftSizeMenuToken)}
                </MenuItem>
              ))}
            </MenuList>
          </Paper>
        </Popper>
      ) : null}
    </Box>
  )
}
